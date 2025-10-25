from inference_sdk import InferenceHTTPClient
import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    
    UPLOAD_FOLDER = os.path.join(basedir,'app','uploads')
    RESULTS_FOLDER = os.path.join(basedir,'app','results')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(RESULTS_FOLDER, exist_ok=True)
    
    # Roboflow API Setup

    CLIENT = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key="3IU9udNBJgg1CMyaG6Z8"
    )
    MODEL_ID = "garbage-can-overflow/1"
    SECRET_KEY = 'try me'
    SQLALCHEMY_DATABASE_URI =os.environ.get('DATABASE_URL') or \
        'sqlite:///'+os.path.join(basedir,'instances','app.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False