from datetime import datetime
from config import Config
import cv2
import os 
CLIENT = Config.CLIENT
MODEL_ID = Config.MODEL_ID
RESULTS_FOLDER = Config.RESULTS_FOLDER
import uuid

def predict_and_annotate(image_path):
    """Run inference and annotate image"""
    try:
        result = CLIENT.infer(image_path, model_id=MODEL_ID)
        img = cv2.imread(image_path)
        
        if img is None:
            return {"error": "Failed to read image"}
        
        height, width, _ = img.shape
        preds = result.get("predictions", [])
        total_garbage_area = 0
        detected_items = []

        for pred in preds:
            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
            class_name = pred["class"]
            conf = pred["confidence"]

            # Convert to box corners
            x1, y1 = int(x - w / 2), int(y - h / 2)
            x2, y2 = int(x + w / 2), int(y + h / 2)

            # Draw bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, f"{class_name} {conf:.2f}",
                        (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (0, 255, 0), 2)

            # Track detected items
            detected_items.append({
                "class": class_name,
                "confidence": round(conf * 100, 2)
            })

            # Add area for fullness estimate
            total_garbage_area += w * h

        # Estimate fullness
        fullness_pct = (total_garbage_area / (width * height)) * 100 if preds else 0

        # Categorize fullness
        if fullness_pct == 0:
            fullness_status = "Empty"
            fill_level = 0
            urgency = "Low"
        elif fullness_pct < 20:
            fullness_status = "Low"
            fill_level = round(fullness_pct, 1)
            urgency = "Low"
        elif fullness_pct < 60:
            fullness_status = "Half Full"
            fill_level = round(fullness_pct, 1)
            urgency = "Medium"
        elif fullness_pct < 90:
            fullness_status = "Almost Full"
            fill_level = round(fullness_pct, 1)
            urgency = "High"
        else:
            fullness_status = "Overflow"
            fill_level = round(fullness_pct, 1)
            urgency = "Critical"

        # Determine waste type from detected items
        waste_types = list(set([item["class"] for item in detected_items]))
        waste_type = "Mixed Waste" if len(waste_types) > 1 else (waste_types[0] if waste_types else "Unknown")

        # Save annotated image
        output_filename = f"{uuid.uuid4().hex}.jpg"
        output_path = os.path.join(RESULTS_FOLDER, output_filename)
        cv2.imwrite(output_path, img)

        return {
            "success": True,
            "wasteType": waste_type,
            "urgency": urgency,
            "fillLevel": fill_level,
            "confidence": round(sum([p["confidence"] for p in preds]) / len(preds) * 100, 2) if preds else 0,
            "detectedItems": [item["class"] for item in detected_items],
            "predictions": len(preds),
            "output_image": output_filename,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
