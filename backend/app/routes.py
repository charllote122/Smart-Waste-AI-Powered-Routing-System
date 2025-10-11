import uuid
from app import app,db
from app.models import User,Cameras,Statistics,Reports
from predict import predict_and_annotate
from config import Config
from flask import request, jsonify, send_from_directory
from datetime import datetime
import base64
from sqlalchemy import func

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
        results["annotated_image_url"] = f"/api/results/{results['output_image']}"
        
        # Extract prediction details
        first_prediction = results.get("predictions", [{}])[0]
        detected_class = first_prediction.get("class", "N/A")
        confidence = first_prediction.get("confidence", 0.0)
        confidence_percent = float(confidence) * 100
        fullness = results.get("fullness", 0)
        
        # Determine priority based on fullness
        if fullness <= 20:
            priority = "Low"
        elif fullness <= 60:
            priority = "Medium"
        else:
            priority = "High"
        
        # Only save report if fullness > 50%
        report_saved = False
        report_id = None
        
        if fullness > 50:
            try:
                # Read the annotated image file
                annotated_image_path = os.path.join(RESULTS_FOLDER, results['output_image'])
                with open(annotated_image_path, 'rb') as img_file:
                    img_byte_arr = img_file.read()
                
                # Extract location from request if provided
                location = request.form.get('location', 'Nairobi')
                
                # Create new report
                new_report = Reports(
                    location=location,
                    priority=priority,
                    status="Pending",
                    ai_confidence=int(confidence_percent),
                    image_data=img_byte_arr,
                    image_name=results['output_image']
                )
                
                db.session.add(new_report)
                db.session.commit()
                
                report_saved = True
                report_id = new_report.id
                
                # Update statistics
                update_statistics()
                
            except Exception as e:
                db.session.rollback()
                print(f"Error saving report: {str(e)}")
                # Continue even if report saving fails
        
        # Prepare response
        response_data = {
            'success': True,
            'data': {
                'results': results,
                'fullness': fullness,
                'detected_class': detected_class,
                'confidence': f"{confidence_percent:.2f}%",
                'confidence_value': confidence_percent,
                'priority': priority,
                'annotated_image_url': results["annotated_image_url"],
                'report_saved': report_saved,
                'report_id': report_id,
                'save_threshold': 50,
                'message': f"Report {'saved' if report_saved else 'not saved'} - Fullness: {fullness}%"
            }
        }
        
        return jsonify(response_data), 200
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
    reports_saved = 0

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
            
            # Extract details for report
            first_prediction = analysis.get("predictions", [{}])[0]
            confidence = first_prediction.get("confidence", 0.0)
            confidence_percent = float(confidence) * 100
            fullness = analysis.get("fullness", 0)
            
            # Determine priority
            if fullness <= 20:
                priority = "Low"
            elif fullness <= 60:
                priority = "Medium"
            else:
                priority = "High"
            
            analysis["priority"] = priority
            analysis["confidence_percent"] = f"{confidence_percent:.2f}%"
            
            # Save report if fullness > 50%
            if fullness > 50:
                try:
                    annotated_image_path = os.path.join(RESULTS_FOLDER, analysis['output_image'])
                    with open(annotated_image_path, 'rb') as img_file:
                        img_byte_arr = img_file.read()
                    
                    new_report = Reports(
                        location='Batch Analysis',
                        priority=priority,
                        status="Pending",
                        ai_confidence=int(confidence_percent),
                        image_data=img_byte_arr,
                        image_name=analysis['output_image']
                    )
                    
                    db.session.add(new_report)
                    db.session.commit()
                    
                    analysis["report_saved"] = True
                    analysis["report_id"] = new_report.id
                    reports_saved += 1
                    
                except Exception as e:
                    db.session.rollback()
                    print(f"Error saving batch report: {str(e)}")
                    analysis["report_saved"] = False
            else:
                analysis["report_saved"] = False
            
            results.append(analysis)
    
    # Update statistics once after batch processing
    if reports_saved > 0:
        update_statistics()

    return jsonify({
        "success": True,
        "count": len(results),
        "reports_saved": reports_saved,
        "results": results
    }), 200


def update_statistics():
    """Helper function to update statistics based on reports"""
    try:
        # Get or create statistics record
        stats = Statistics.query.first()
        if not stats:
            stats = Statistics(
                imganalyzed=0,
                wastedected=0,
                avgconfidence=0,
                detectionrate=0
            )
            db.session.add(stats)
        
        # Calculate statistics from reports
        total_reports = Reports.query.count()
        reports_with_images = Reports.query.filter(Reports.image_data.isnot(None)).count()
        
        # Calculate average confidence
        avg_confidence_result = db.session.query(func.avg(Reports.ai_confidence)).scalar()
        avg_confidence = int(avg_confidence_result) if avg_confidence_result else 0
        
        # Count waste detected (reports with confidence > 0)
        waste_detected = Reports.query.filter(Reports.ai_confidence > 0).count()
        
        # Calculate detection rate (percentage of reports with high confidence)
        detection_rate = int((waste_detected / total_reports * 100)) if total_reports > 0 else 0
        
        # Update statistics
        stats.imganalyzed = reports_with_images
        stats.wastedected = waste_detected
        stats.avgconfidence = avg_confidence
        stats.detectionrate = detection_rate
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating statistics: {str(e)}")



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



# ===========================
# CAMERA ROUTES
# ===========================

@app.route('/api/cameras', methods=['POST'])
def add_camera():
    """Add a new camera to the database"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Camera name is required'}), 400
        if not data.get('ipaddress'):
            return jsonify({'error': 'IP address is required'}), 400
        
        # Create new camera
        new_camera = Cameras(
            name=data['name'],
            location=data.get('location', 0),
            status=data.get('status', 1),  # Default: active
            ipaddress=data['ipaddress']
        )
        
        db.session.add(new_camera)
        db.session.commit()
        
        return jsonify({
            'message': 'Camera added successfully',
            'camera': {
                'id': new_camera.id,
                'name': new_camera.name,
                'location': new_camera.location,
                'status': new_camera.status,
                'ipaddress': new_camera.ipaddress
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/cameras', methods=['GET'])
def view_cameras():
    """Get all cameras from the database"""
    try:
        cameras = Cameras.query.all()
        
        cameras_list = [{
            'id': camera.id,
            'name': camera.name,
            'location': camera.location,
            'status': camera.status,
            'ipaddress': camera.ipaddress
        } for camera in cameras]
        
        return jsonify({
            'count': len(cameras_list),
            'cameras': cameras_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/cameras/<int:camera_id>', methods=['GET'])
def get_camera(camera_id):
    """Get a specific camera by ID"""
    try:
        camera = Cameras.query.get_or_404(camera_id)
        
        return jsonify({
            'id': camera.id,
            'name': camera.name,
            'location': camera.location,
            'status': camera.status,
            'ipaddress': camera.ipaddress
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@app.route('/api/cameras/<int:camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """Update camera details"""
    try:
        camera = Cameras.query.get_or_404(camera_id)
        data = request.get_json()
        
        if 'name' in data:
            camera.name = data['name']
        if 'location' in data:
            camera.location = data['location']
        if 'status' in data:
            camera.status = data['status']
        if 'ipaddress' in data:
            camera.ipaddress = data['ipaddress']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Camera updated successfully',
            'camera': {
                'id': camera.id,
                'name': camera.name,
                'location': camera.location,
                'status': camera.status,
                'ipaddress': camera.ipaddress
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/cameras/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """Delete a camera"""
    try:
        camera = Cameras.query.get_or_404(camera_id)
        db.session.delete(camera)
        db.session.commit()
        
        return jsonify({'message': 'Camera deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===========================
# REPORTS ROUTES
# ===========================

@app.route('/api/reports', methods=['POST'])
def create_report():
    """Create a new waste report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('location'):
            return jsonify({'error': 'Location is required'}), 400
        
        # Handle image data (base64)
        image_data = None
        image_name = None
        
        if 'image' in data and data['image']:
            # Decode base64 image
            try:
                # Remove data:image/...;base64, prefix if present
                image_string = data['image']
                if 'base64,' in image_string:
                    image_string = image_string.split('base64,')[1]
                
                image_data = base64.b64decode(image_string)
                image_name = data.get('image_name', f'report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg')
            except Exception as img_error:
                return jsonify({'error': f'Invalid image data: {str(img_error)}'}), 400
        
        # Create new report
        new_report = Reports(
            location=data['location'],
            priority=data.get('priority', 'Medium'),
            status=data.get('status', 'Pending'),
            ai_confidence=data.get('ai_confidence', 0),
            image_data=image_data,
            image_name=image_name
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        # Update statistics after creating report
        update_statistics()
        
        return jsonify({
            'message': 'Report created successfully',
            'report': {
                'id': new_report.id,
                'location': new_report.location,
                'priority': new_report.priority,
                'status': new_report.status,
                'ai_confidence': new_report.ai_confidence,
                'reportedAt': new_report.reportedAt.isoformat() if new_report.reportedAt else None,
                'has_image': image_data is not None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all reports with optional filtering"""
    try:
        # Query parameters for filtering
        status = request.args.get('status')
        priority = request.args.get('priority')
        limit = request.args.get('limit', type=int)
        
        query = Reports.query
        
        if status:
            query = query.filter(Reports.status == status)
        if priority:
            query = query.filter(Reports.priority == priority)
        
        # Order by most recent first
        query = query.order_by(Reports.reportedAt.desc())
        
        if limit:
            query = query.limit(limit)
        
        reports = query.all()
        
        reports_list = [{
            'id': report.id,
            'location': report.location,
            'priority': report.priority,
            'status': report.status,
            'ai_confidence': report.ai_confidence,
            'reportedAt': report.reportedAt.isoformat() if report.reportedAt else None,
            'has_image': report.image_data is not None,
            'image_name': report.image_name
        } for report in reports]
        
        return jsonify({
            'count': len(reports_list),
            'reports': reports_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report by ID"""
    try:
        report = Reports.query.get_or_404(report_id)
        
        response_data = {
            'id': report.id,
            'location': report.location,
            'priority': report.priority,
            'status': report.status,
            'ai_confidence': report.ai_confidence,
            'reportedAt': report.reportedAt.isoformat() if report.reportedAt else None,
            'image_name': report.image_name
        }
        
        # Include base64 encoded image if requested
        if request.args.get('include_image') == 'true' and report.image_data:
            response_data['image'] = base64.b64encode(report.image_data).decode('utf-8')
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@app.route('/api/reports/<int:report_id>', methods=['PUT'])
def update_report(report_id):
    """Update report details"""
    try:
        report = Reports.query.get_or_404(report_id)
        data = request.get_json()
        
        if 'location' in data:
            report.location = data['location']
        if 'priority' in data:
            report.priority = data['priority']
        if 'status' in data:
            report.status = data['status']
        if 'ai_confidence' in data:
            report.ai_confidence = data['ai_confidence']
        
        db.session.commit()
        
        # Update statistics
        update_statistics()
        
        return jsonify({
            'message': 'Report updated successfully',
            'report': {
                'id': report.id,
                'location': report.location,
                'priority': report.priority,
                'status': report.status,
                'ai_confidence': report.ai_confidence,
                'reportedAt': report.reportedAt.isoformat() if report.reportedAt else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a report"""
    try:
        report = Reports.query.get_or_404(report_id)
        db.session.delete(report)
        db.session.commit()
        
        # Update statistics
        update_statistics()
        
        return jsonify({'message': 'Report deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>/image', methods=['GET'])
def get_report_image(report_id):
    """Get the image for a specific report"""
    try:
        report = Reports.query.get_or_404(report_id)
        
        if not report.image_data:
            return jsonify({'error': 'No image available for this report'}), 404
        
        return jsonify({
            'image': base64.b64encode(report.image_data).decode('utf-8'),
            'image_name': report.image_name
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404


# ===========================
# STATISTICS ROUTES
# ===========================

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get current statistics"""
    try:
        # Try to get existing statistics record
        stats = Statistics.query.first()
        
        if not stats:
            # Create initial statistics if none exist
            stats = Statistics(
                imganalyzed=0,
                wastedected=0,
                avgconfidence=0,
                detectionrate=0
            )
            db.session.add(stats)
            db.session.commit()
        
        return jsonify({
            'id': stats.id,
            'imganalyzed': stats.imganalyzed,
            'wastedected': stats.wastedected,
            'avgconfidence': stats.avgconfidence,
            'detectionrate': stats.detectionrate
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/statistics/update', methods=['POST'])
def manual_update_statistics():
    """Manually trigger statistics update"""
    try:
        update_statistics()
        return jsonify({'message': 'Statistics updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_statistics():
    """Helper function to update statistics based on reports"""
    try:
        # Get or create statistics record
        stats = Statistics.query.first()
        if not stats:
            stats = Statistics(
                imganalyzed=0,
                wastedected=0,
                avgconfidence=0,
                detectionrate=0
            )
            db.session.add(stats)
        
        # Calculate statistics from reports
        total_reports = Reports.query.count()
        reports_with_images = Reports.query.filter(Reports.image_data.isnot(None)).count()
        
        # Calculate average confidence
        avg_confidence_result = db.session.query(func.avg(Reports.ai_confidence)).scalar()
        avg_confidence = int(avg_confidence_result) if avg_confidence_result else 0
        
        # Count waste detected (reports with confidence > 0)
        waste_detected = Reports.query.filter(Reports.ai_confidence > 0).count()
        
        # Calculate detection rate (percentage of reports with high confidence)
        detection_rate = int((waste_detected / total_reports * 100)) if total_reports > 0 else 0
        
        # Update statistics
        stats.imganalyzed = reports_with_images
        stats.wastedected = waste_detected
        stats.avgconfidence = avg_confidence
        stats.detectionrate = detection_rate
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating statistics: {str(e)}")


# ===========================
# DASHBOARD/SUMMARY ROUTES
# ===========================

@app.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    """Get dashboard summary with key metrics"""
    try:
        total_cameras = Cameras.query.count()
        active_cameras = Cameras.query.filter(Cameras.status == 1).count()
        total_reports = Reports.query.count()
        pending_reports = Reports.query.filter(Reports.status == 'Pending').count()
        critical_reports = Reports.query.filter(Reports.priority == 'Critical').count()
        
        stats = Statistics.query.first()
        
        return jsonify({
            'cameras': {
                'total': total_cameras,
                'active': active_cameras,
                'inactive': total_cameras - active_cameras
            },
            'reports': {
                'total': total_reports,
                'pending': pending_reports,
                'critical': critical_reports
            },
            'statistics': {
                'imganalyzed': stats.imganalyzed if stats else 0,
                'wastedected': stats.wastedected if stats else 0,
                'avgconfidence': stats.avgconfidence if stats else 0,
                'detectionrate': stats.detectionrate if stats else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


