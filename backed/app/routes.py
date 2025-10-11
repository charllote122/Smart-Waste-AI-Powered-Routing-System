import uuid
from app import app,db
from models import User,Cameras,Statistics,Reports
from predict import predict_and_annotate
from config import Config
from flask import request, jsonify, send_from_directory
from datetime import datetime
from config import Config
import cv2

import os 
CLIENT = Config.CLIENT
MODEL_ID = Config.MODEL_ID
RESULTS_FOLDER = Config.RESULTS_FOLDER
UPLOAD_FOLDER = Config.UPLOAD_FOLDER
import uuid
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
        
        # first_prediction = results.get("predictions", [{}])[0]
        # detected_class = first_prediction.get("class", "N/A")
        # confidence = first_prediction.get("confidence", 0.0)
        # confidence_percent = f"{float(confidence)*100:.2f}%"
        # results["annotated_image_url"] = f"/api/results/{results['output_image']}"
        # file = results['output_image']
        # img_byte_arr = file.read()
        # filename= os.path.splitext(file.filename)[0]
        # #filename = pname
        # fileext = os.path.splitext(file.filename)[1]
        # fileext = ".jpg"
        # file.filename = filename+fileext
        # fullness = results["fullness"]
        # if fullness <= 20:
        #     priority = "low"
        # elif fullness >= 20 and fullness <=60:
        #     priority = "medium"
        # else:
        #     priority = "high"
        # newrep = Reports(location='nairobi',priority= priority,status="not done",ai_confidence=confidence_percent,image_data=img_byte_arr, image_name=file.filename)
        # db.session.add(newrep)
        # db.session.commit()
        
        return jsonify(results), 200

        #             return jsonify({
        #         'status': 'success',
        #         'data': {
        #             'results': results,
        #             'image_file': image_file,
        #             'fullness': fullness,
        #             'detected_class': detected_class,
        #             'confidence': confidence
        #         }
        #     })
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

@app.route("/", methods=["GET"])
@app.route("/index", methods=["GET"])
@app.route("/home", methods=["GET"])
@app.route("/dashboard", methods=["GET"])
def index():
    return jsonify({
        "message": "Welcome to the WasteSpotter AI API. Use  to analyze images."
    })
