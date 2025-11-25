from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="HR Performance Prediction API",
    description="ML model serving for employee performance predictions",
    version="1.0.0"
)

# Enable CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
preprocessor = None
performance_score_model = None
performance_class_model = None
recommendation_model = None
le_performance_class = None
le_recommend = None

# Path to models directory
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


# Input schema matching the 20 required fields
class EmployeeData(BaseModel):
    Department: str
    JobRole: str
    Level: str
    WorkLocation: str
    SalaryBand: str
    YearsInCompany: float
    YearsInRole: float
    AttendanceRate: float
    OnTimeRate: float
    AvgLateMinutes: float
    AvgWorkHours: float
    MonthlyHoursWorked: float
    TasksAssigned: int
    TasksCompleted: int
    TaskQualityScore: float
    PeerReviewScore: float
    ManagerRating: float
    TrainingHoursCompleted: float
    PromotionsLast3Years: int
    DisciplinaryActions: int


# Output schema
class PredictionResponse(BaseModel):
    PerformanceScore: float
    PerformanceClass: str
    Recommend: str


@app.on_event("startup")
async def load_models():
    """Load all models on startup"""
    global preprocessor, performance_score_model, performance_class_model
    global recommendation_model, le_performance_class, le_recommend
    
    try:
        print("Loading models...")
        
        # Load preprocessor
        preprocessor = joblib.load(MODELS_DIR / "preprocessor.joblib")
        print("✓ Preprocessor loaded")
        
        # Load regression model
        performance_score_model = joblib.load(MODELS_DIR / "best_performance_score_model.pkl")
        print("✓ Performance Score model loaded")
        
        # Load classification models
        performance_class_model = joblib.load(MODELS_DIR / "best_performance_class_model.pkl")
        print("✓ Performance Class model loaded")
        
        recommendation_model = joblib.load(MODELS_DIR / "best_recommendation_model.pkl")
        print("✓ Recommendation model loaded")
        
        # Load label encoders
        le_performance_class = joblib.load(MODELS_DIR / "le_performance_class.joblib")
        print("✓ Performance Class label encoder loaded")
        
        le_recommend = joblib.load(MODELS_DIR / "le_recommend.joblib")
        print("✓ Recommendation label encoder loaded")
        
        print("✅ All models loaded successfully!")
        
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "HR Performance Prediction API is running",
        "models_loaded": all([
            preprocessor is not None,
            performance_score_model is not None,
            performance_class_model is not None,
            recommendation_model is not None,
            le_performance_class is not None,
            le_recommend is not None
        ])
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(employee_data: EmployeeData):
    """
    Generate predictions for employee performance
    
    Args:
        employee_data: Employee data with 20 required fields
        
    Returns:
        PredictionResponse with PerformanceScore, PerformanceClass, and Recommend
    """
    try:
        # Check if models are loaded
        if preprocessor is None:
            raise HTTPException(status_code=503, detail="Models not loaded yet")
        
        # Convert input data to DataFrame
        # Note: Field names must match the training data exactly
        input_dict = {
            'Department': employee_data.Department,
            'JobRole': employee_data.JobRole,
            'Level': employee_data.Level,
            'YearsInCompany': employee_data.YearsInCompany,
            'YearsInRole': employee_data.YearsInRole,
            'WorkLocation': employee_data.WorkLocation,
            'SalaryBand': employee_data.SalaryBand,
            'AttendanceRate': employee_data.AttendanceRate,
            'OnTimeRate': employee_data.OnTimeRate,
            'AvgLateMinutes': employee_data.AvgLateMinutes,
            'AvgWorkHours': employee_data.AvgWorkHours,
            'MonthlyHoursWorked': employee_data.MonthlyHoursWorked,
            'TasksAssigned': employee_data.TasksAssigned,
            'TasksCompleted': employee_data.TasksCompleted,
            'TaskQualityScore': employee_data.TaskQualityScore,
            'PeerReviewScore': employee_data.PeerReviewScore,
            'ManagerRating': employee_data.ManagerRating,
            'TrainingHoursCompleted': employee_data.TrainingHoursCompleted,
            'PromotionsLast3Years': employee_data.PromotionsLast3Years,
            'DisciplinaryActions': employee_data.DisciplinaryActions
        }
        
        # Create DataFrame with single row
        df = pd.DataFrame([input_dict])
        
        # Preprocess the data
        X_processed = preprocessor.transform(df)
        
        # Make predictions
        # 1. Performance Score (Regression)
        performance_score = float(performance_score_model.predict(X_processed)[0])
        
        # 2. Performance Class (Classification)
        performance_class_encoded = performance_class_model.predict(X_processed)[0]
        performance_class = le_performance_class.inverse_transform([performance_class_encoded])[0]
        
        # 3. Recommendation (Classification)
        recommend_encoded = recommendation_model.predict(X_processed)[0]
        recommend = le_recommend.inverse_transform([recommend_encoded])[0]
        
        # Return predictions
        return PredictionResponse(
            PerformanceScore=round(performance_score, 2),
            PerformanceClass=performance_class,
            Recommend=recommend
        )
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            "preprocessor": preprocessor is not None,
            "performance_score": performance_score_model is not None,
            "performance_class": performance_class_model is not None,
            "recommendation": recommendation_model is not None,
            "label_encoders": {
                "performance_class": le_performance_class is not None,
                "recommend": le_recommend is not None
            }
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
