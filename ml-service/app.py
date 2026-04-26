from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
import os
import time
import requests
import json
from sklearn.preprocessing import StandardScaler, LabelEncoder

app = Flask(__name__)

# Configuration (Defaults, will be overwritten by backend config)
CONFIG = {
    "ml_threshold": 0.8,
    "feature_count": 10
}

MODEL_PATH = 'ids_model.pkl'
SCALER_PATH = 'ids_scaler.pkl'

# Global Model Variables
model = None
scaler = None
label_encoder = None

def load_model():
    global model, scaler, label_encoder
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            # label_encoder = joblib.load('label_encoder.pkl') # Optional if needed
            print("Model loaded successfully.")
            return True
        else:
            print("Model file not found. Running in dummy mode.")
            return False
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Initial Load
load_model()

@app.route('/reload-model', methods=['POST'])
def reload_model_endpoint():
    success = load_model()
    return jsonify({"status": "success" if success else "error", "message": "Model reload attempted"}), 200

@app.route('/update-config', methods=['POST'])
def update_config():
    global CONFIG
    data = request.json
    CONFIG.update(data)
    print(f"Config updated: {CONFIG}")
    return jsonify({"status": "success", "config": CONFIG}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    start_time = time.time()
    
    # 1. Check if model is loaded
    if model is None:
        # Dummy response if no model (for testing/resilience)
        return jsonify({
            "threat": False,
            "confidence": 0.0,
            "processing_time_ms": (time.time() - start_time) * 1000,
            "message": "No model loaded, allowing traffic by default"
        })

    try:
        # 2. Parse Features
        data = request.json
        features = data.get('features') # Expecting list/array of feature values
        
        if not features:
             return jsonify({"error": "No features provided"}), 400

        # 3. Preprocess
        # Ensure features match expected input shape. 
        # For simplicity in this demo, we assume the input is already a list of numbers matching the model's expectation.
        # In a real scenario, we might need to map named features to the correct order.
        
        features_array = np.array(features).reshape(1, -1)
        
        # Scale
        if scaler:
            features_array = scaler.transform(features_array)

        # 4. Predict
        # Getting probability [Benign_Prob, Malicious_Prob] (assuming binary or multi-class)
        # Random Forest `predict_proba` returns list of probs for each class
        probs = model.predict_proba(features_array)[0] 
        
        # Assuming index 0 is BENIGN (need to verify with LabelEncoder classes in real implementation)
        # For this logic, let's assume max probability class is the prediction
        pred_class_index = np.argmax(probs)
        confidence = float(probs[pred_class_index])
        
        # Threshold Logic (assuming we know which class is malicious)
        # If we don't have the label encoder map at runtime easily, we can stick to:
        # If confidence is low, flag as potential anomaly? 
        # Or if predicted class != 'BENIGN' (need mapping)
        
        # SIMPLIFIED LOGIC FOR DEMO:
        # If confidence > threshold AND class is NOT 0 (assuming 0 is 'BENIGN'), then BLOCK.
        # This requires accurate class mapping.
        
        is_threat = False
        if pred_class_index != 0: # Assuming 0 is BENIGN
             if confidence > CONFIG["ml_threshold"]:
                 is_threat = True
        
        processing_time = (time.time() - start_time) * 1000
        
        return jsonify({
            "threat": is_threat,
            "confidence": confidence,
            "processing_time_ms": processing_time,
            "predicted_class": int(pred_class_index)
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/metrics', methods=['GET'])
def metrics():
    import psutil
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    return jsonify({
        "status": "active",
        "model_loaded": model is not None,
        "memory_usage_mb": memory_info.rss / 1024 / 1024,
        "config": CONFIG
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
