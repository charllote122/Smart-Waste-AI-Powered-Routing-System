import os
import cv2
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from inference_sdk import InferenceHTTPClient
from datetime import datetime

# Flask Setup

app = Flask(__name__)
CORS(app)  

UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Roboflow API Setup

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="3IU9udNBJgg1CMyaG6Z8"
)
MODEL_ID = "garbage-can-overflow/1"


# Inference + Drawing

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


# API Routes


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "WasteSpotter AI API",
        "version": "1.0"
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    """
    Main analysis endpoint for React frontend
    Expects: multipart/form-data with 'image' file
    Returns: JSON with analysis results
    """
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided"
        }), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "No file selected"
        }), 400

    # Save uploaded file
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{file_ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run analysis
    results = predict_and_annotate(filepath)
    
    if results.get("success"):
        # Add image URL to response
        results["annotated_image_url"] = f"/api/results/{results['output_image']}"
        return jsonify(results), 200
    else:
        return jsonify(results), 500

@app.route("/api/results/<filename>", methods=["GET"])
def get_result_image(filename):
    """Serve annotated result images"""
    return send_from_directory(RESULTS_FOLDER, filename)

@app.route("/api/batch-analyze", methods=["POST"])
def batch_analyze():
    """
    Batch analysis endpoint for multiple images
    """
    if 'images' not in request.files:
        return jsonify({
            "success": False,
            "error": "No images provided"
        }), 400

    files = request.files.getlist('images')
    results = []

    for file in files:
        if file.filename == '':
            continue

        # Save and analyze each file
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4().hex}.{file_ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        analysis = predict_and_annotate(filepath)
        if analysis.get("success"):
            analysis["annotated_image_url"] = f"/api/results/{analysis['output_image']}"
            analysis["original_filename"] = file.filename
            results.append(analysis)

    return jsonify({
        "success": True,
        "count": len(results),
        "results": results
    }), 200

# Error Handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

# ---------------------------
# Run App
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)