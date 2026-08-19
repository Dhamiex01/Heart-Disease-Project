import os
import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


# ============================================================
# APP INITIALIZATION
# ============================================================

app = FastAPI(
    title="Heart Health AI",
    description="Machine-learning based heart disease risk assessment",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")


MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")


# ============================================================
# GLOBAL VARIABLES
# ============================================================

model = None
scaler = None

# IMPORTANT:
# This must exist before /result-data is called.
last_result = None


# ============================================================
# LOAD MODEL
# ============================================================

try:

    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")

except Exception as e:

    print("ERROR loading model:")
    print(e)

    model = None


# ============================================================
# LOAD SCALER
# ============================================================

try:

    scaler = joblib.load(SCALER_PATH)
    print("Scaler loaded successfully.")

except Exception as e:

    print("ERROR loading scaler:")
    print(e)

    scaler = None


# ============================================================
# FEATURE ORDER
# ============================================================

feature_names = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]


# ============================================================
# PATIENT DATA MODEL
# ============================================================

from pydantic import BaseModel


class PatientData(BaseModel):

    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float


# ============================================================
# STATIC FILES
# ============================================================

if os.path.isdir(FRONTEND_DIR):

    app.mount(
        "/static",
        StaticFiles(directory=FRONTEND_DIR),
        name="static"
    )


# ============================================================
# HOME PAGE
# ============================================================

@app.get("/")
def home():

    index_file = os.path.join(
        FRONTEND_DIR,
        "index.html"
    )

    return FileResponse(index_file)


# ============================================================
# RESULT PAGE
# ============================================================

@app.get("/result.html")
def result_page():

    result_file = os.path.join(
        FRONTEND_DIR,
        "result.html"
    )

    return FileResponse(result_file)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    if model is None:

        return {
            "error": "Model is not loaded."
        }

    return {
        "model_type": str(type(model)),
        "number_of_features": len(feature_names),
        "feature_names": feature_names,
        "classes": getattr(
            model,
            "classes_",
            None
        ).tolist()
        if hasattr(model, "classes_")
        else None
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
def predict(data: PatientData):

    global last_result

    # --------------------------------------------------------
    # CHECK MODEL
    # --------------------------------------------------------

    if model is None:

        return {
            "error": "Machine learning model is not loaded."
        }


    # --------------------------------------------------------
    # CHECK SCALER
    # --------------------------------------------------------

    if scaler is None:

        return {
            "error": "Scaler is not loaded."
        }


    # --------------------------------------------------------
    # CREATE INPUT DATAFRAME
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [[
            data.age,
            data.sex,
            data.cp,
            data.trestbps,
            data.chol,
            data.fbs,
            data.restecg,
            data.thalach,
            data.exang,
            data.oldpeak,
            data.slope,
            data.ca,
            data.thal
        ]],
        columns=feature_names
    )


    # --------------------------------------------------------
    # SCALE DATA
    # --------------------------------------------------------

    scaled_data = scaler.transform(input_data)


    # --------------------------------------------------------
    # MAKE PREDICTION
    # --------------------------------------------------------

    prediction = model.predict(scaled_data)[0]


    # --------------------------------------------------------
    # MODEL CONFIDENCE
    # --------------------------------------------------------

    confidence = None

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(
            scaled_data
        )[0]

        confidence = float(
            max(probabilities) * 100
        )


    # --------------------------------------------------------
    # RESULT INTERPRETATION
    # --------------------------------------------------------

    if int(prediction) == 1:

        result_title = "Higher Likelihood of Heart Disease"

        result_message = (
            "The model predicts a higher likelihood "
            "of heart disease based on the information provided."
        )

        result_status = "higher"

    else:

        result_title = "Lower Likelihood of Heart Disease"

        result_message = (
            "The model predicts a lower likelihood "
            "of heart disease based on the information provided."
        )

        result_status = "lower"


    # --------------------------------------------------------
    # FORMAT CONFIDENCE
    # --------------------------------------------------------

    if confidence is not None:

        confidence_display = f"{confidence:.0f}%"

    else:

        confidence_display = "N/A"


    # --------------------------------------------------------
    # STORE RESULT
    # --------------------------------------------------------

    last_result = {
        "success": True,
        "prediction": int(prediction),
        "result": result_status,
        "title": result_title,
        "message": result_message,
        "confidence": confidence,
        "confidence_display": confidence_display,

        "patient": {

            "age": data.age,
            "sex": data.sex,
            "cp": data.cp,
            "trestbps": data.trestbps,
            "chol": data.chol,
            "fbs": data.fbs,
            "restecg": data.restecg,
            "thalach": data.thalach,
            "exang": data.exang,
            "oldpeak": data.oldpeak,
            "slope": data.slope,
            "ca": data.ca,
            "thal": data.thal
        }

    }


    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

    return last_result


# ============================================================
# RESULT DATA
# ============================================================

# ============================================================
# RESULT DATA
# ============================================================

@app.get("/result-data")
def get_result_data():

    global last_result

    if last_result is None:
        return {
            "error": "No prediction result is available yet."
        }

    return last_result

# ============================================================
# RUN INFORMATION
# ============================================================

@app.get("/openapi.json")
def openapi_info():

    return app.openapi()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )