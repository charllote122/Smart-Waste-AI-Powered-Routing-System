import os
import cv2
import json
import uuid
from flask import Flask, request, render_template, send_from_directory
from inference_sdk import InferenceHTTPClient

# ---------------------------
# Flask Setup
# ---------------------------
app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# ---------------------------
# Roboflow API Setup
# ---------------------------
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="3IU9udNBJgg1CMyaG6Z8"
)
MODEL_ID = "garbage-can-overflow/1"

# ---------------------------
# Fullness Mapping (Example)
# ---------------------------
FULLNESS_CLASSES = {
    "empty": "Empty (0-20%)",
    "half_full": "Half Full (~50%)",
    "full": "Full (~80%)",
    "overflow": "Overflowing (100%+)"
}

# ---------------------------
# Inference + Drawing
# ---------------------------
def predict_and_annotate(image_path):
    result = CLIENT.infer(image_path, model_id=MODEL_ID)

    img = cv2.imread(image_path)
    height, width, _ = img.shape

    preds = result.get("predictions", [])
    total_garbage_area = 0

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

        # Add area for fullness estimate
        total_garbage_area += w * h

    # Estimate fullness (garbage area ÷ image area)
    fullness_pct = (total_garbage_area / (width * height)) * 100 if preds else 0

    # Categorize into labels
    if fullness_pct == 0:
        fullness_status = "Empty (0%)"
    elif fullness_pct < 20:
        fullness_status = f"Low (~{round(fullness_pct,1)}%)"
    elif fullness_pct < 60:
        fullness_status = f"Half Full (~{round(fullness_pct,1)}%)"
    elif fullness_pct < 90:
        fullness_status = f"Almost Full (~{round(fullness_pct,1)}%)"
    else:
        fullness_status = f"Overflow (~{round(fullness_pct,1)}%)"

    # Save annotated image
    output_filename = f"{uuid.uuid4().hex}.jpg"
    output_path = os.path.join(RESULTS_FOLDER, output_filename)
    cv2.imwrite(output_path, img)

    return {
        "predictions": preds,
        "fullness": fullness_status,
        "output_image": output_filename
    }

# ---------------------------
# Routes
# ---------------------------
@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files.get("file")
        if not file or file.filename == "":
            return "No file uploaded", 400

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        results = predict_and_annotate(filepath)

        return render_template(
            "result.html",
            filename=file.filename,
            results=json.dumps(results, indent=2),
            image_file=results["output_image"],
            fullness=results["fullness"]
        )

    return render_template("upload.html")

@app.route("/results/<filename>")
def send_result(filename):
    return send_from_directory(RESULTS_FOLDER, filename)

# ---------------------------
# Run App
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
