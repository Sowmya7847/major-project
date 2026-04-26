import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
import sys

# Configuration
DATASET_PATH = 'CIC-IDS2017.csv' # User should update this path
MODEL_SAVE_PATH = 'ids_model.pkl'
SCALER_SAVE_PATH = 'ids_scaler.pkl'

def load_data(path):
    """
    Load dataset from CSV.
    Handles multiple CSVs if path is a directory, or single CSV.
    """
    if not os.path.exists(path):
        print(f"Error: Dataset not found at {path}")
        print("Please download the CIC-IDS2017 dataset and convert to CSV, or point to the correct file.")
        # Create dummy data for demonstration if file doesn't exist
        print("Generating DUMMY data for demonstration purposes...")
        return generate_dummy_data()

    if os.path.isdir(path):
        # Logic to combine multiple CSVs if needed, for now assume single file or handle list
        files = [f for f in os.listdir(path) if f.endswith('.csv')]
        if not files:
            print("No CSV files found in directory.")
            return None
        print(f"Loading {len(files)} CSV files...")
        df_list = []
        for f in files:
            df = pd.read_csv(os.path.join(path, f))
            df_list.append(df)
        return pd.concat(df_list, ignore_index=True)
    else:
        print(f"Loading dataset from {path}...")
        return pd.read_csv(path)

def generate_dummy_data():
    """Generates synthetic data to prove the script works without the huge dataset."""
    np.random.seed(42)
    rows = 1000
    features = 10
    
    data = np.random.rand(rows, features)
    columns = [f'Feature_{i}' for i in range(features)]
    
    # Synthetic labels
    labels = np.random.choice(['BENIGN', 'DDoS', 'PortScan', 'Bot'], rows, p=[0.7, 0.1, 0.1, 0.1])
    
    df = pd.DataFrame(data, columns=columns)
    df['Label'] = labels
    return df

def preprocess_data(df):
    """
    Clean and preprocess the data.
    """
    print("Preprocessing data...")
    
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    
    # Handle missing/infinite values
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    
    # Separate features and target
    # Assuming 'Label' is the target column name (common in CIC-IDS2017)
    if 'Label' not in df.columns:
        print("Error: 'Label' column not found in dataset.")
        return None, None, None
        
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    # Encode numeric columns only
    # In CIC-IDS2017, most columns are numeric, but check just in case
    X = X.select_dtypes(include=[np.number])
    
    return X, y

def train_model():
    # 1. Load Data
    df = load_data(DATASET_PATH)
    if df is None:
        return

    # 2. Preprocess
    X, y = preprocess_data(df)
    if X is None:
        return

    # Encode Labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print(f"Classes found: {le.classes_}")

    # 3. Split Data
    print("Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    # 4. Scale Features
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. Train Model
    print("Training Random Forest Classifier (this may take a while)...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

    # 6. Evaluate
    print("Evaluating model...")
    y_pred = clf.predict(X_test_scaled)
    
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    print("\n--- Accuracy Score ---")
    print(accuracy_score(y_test, y_pred))

    # 7. Save Model
    print(f"Saving model to {MODEL_SAVE_PATH}...")
    joblib.dump(clf, MODEL_SAVE_PATH)
    joblib.dump(scaler, SCALER_SAVE_PATH)
    joblib.dump(le, 'label_encoder.pkl')
    print("Done!")

if __name__ == "__main__":
    train_model()
