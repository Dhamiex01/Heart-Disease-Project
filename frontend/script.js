/* ============================================================
   HEART HEALTH AI
   FORM VALIDATION + PREDICTION
============================================================ */


/* ============================================================
   GET ELEMENTS
============================================================ */

const form = document.getElementById("heartForm");

const submitButton = document.getElementById("submitButton");


/* ============================================================
   VALIDATION RANGES
============================================================ */

const ranges = {

    age: {
        min: 18,
        max: 120,
        name: "Age"
    },

    trestbps: {
        min: 60,
        max: 250,
        name: "Resting Blood Pressure"
    },

    chol: {
        min: 50,
        max: 700,
        name: "Serum Cholesterol"
    },

    thalach: {
        min: 50,
        max: 250,
        name: "Maximum Heart Rate"
    },

    oldpeak: {
        min: 0,
        max: 10,
        name: "ST Depression"
    }

};


/* ============================================================
   DROPDOWN NAMES
============================================================ */

const selectFields = {

    sex: "Sex",

    fbs: "Fasting Blood Sugar",

    cp: "Chest Pain Type",

    restecg: "Resting ECG",

    exang: "Exercise Induced Angina",

    slope: "ST Segment Slope",

    ca: "Major Vessels (CA)",

    thal: "Thalassemia"

};


/* ============================================================
   SHOW ERROR
============================================================ */

function showError(fieldId, message) {

    const field = document.getElementById(fieldId);

    const error = document.getElementById(
        `${fieldId}Error`
    );


    if (!field || !error) {
        return;
    }


    field.classList.add("input-error");

    error.textContent = message;

    error.style.display = "block";
}


/* ============================================================
   CLEAR ERROR
============================================================ */

function clearError(fieldId) {

    const field = document.getElementById(fieldId);

    const error = document.getElementById(
        `${fieldId}Error`
    );


    if (!field || !error) {
        return;
    }


    field.classList.remove("input-error");

    error.textContent = "";

    error.style.display = "none";
}


/* ============================================================
   VALIDATE NUMERICAL FIELD
============================================================ */

function validateNumber(fieldId) {

    const field = document.getElementById(fieldId);

    const config = ranges[fieldId];


    if (!field || !config) {
        return true;
    }


    const value = field.value.trim();


    /* EMPTY */

    if (value === "") {

        showError(
            fieldId,
            `${config.name} is required.`
        );

        return false;
    }


    const number = Number(value);


    /* NOT A NUMBER */

    if (!Number.isFinite(number)) {

        showError(
            fieldId,
            `${config.name} must be a valid number.`
        );

        return false;
    }


    /* RANGE */

    if (
        number < config.min ||
        number > config.max
    ) {

        showError(
            fieldId,
            `${config.name} must be between ${config.min} and ${config.max}.`
        );

        return false;
    }


    clearError(fieldId);

    return true;
}


/* ============================================================
   VALIDATE DROPDOWN
============================================================ */

function validateSelect(fieldId) {

    const field = document.getElementById(fieldId);

    const fieldName = selectFields[fieldId];


    if (!field) {
        return true;
    }


    if (field.value === "") {

        showError(
            fieldId,
            `${fieldName} is required.`
        );

        return false;
    }


    clearError(fieldId);

    return true;
}


/* ============================================================
   VALIDATE ALL FIELDS
============================================================ */

function validateForm() {

    let isValid = true;

    let firstInvalidField = null;


    /* --------------------------------------------------------
       NUMERICAL FIELDS
    -------------------------------------------------------- */

    const numericalFields = [
        "age",
        "trestbps",
        "chol",
        "thalach",
        "oldpeak"
    ];


    numericalFields.forEach(fieldId => {

        const valid = validateNumber(fieldId);


        if (!valid) {

            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField =
                    document.getElementById(fieldId);
            }
        }

    });


    /* --------------------------------------------------------
       DROPDOWNS
    -------------------------------------------------------- */

    Object.keys(selectFields).forEach(fieldId => {

        const valid = validateSelect(fieldId);


        if (!valid) {

            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField =
                    document.getElementById(fieldId);
            }
        }

    });


    /* --------------------------------------------------------
       SCROLL TO FIRST ERROR
    -------------------------------------------------------- */

    if (!isValid && firstInvalidField) {

        firstInvalidField.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        setTimeout(() => {
            firstInvalidField.focus();
        }, 400);
    }


    return isValid;
}


/* ============================================================
   LIVE VALIDATION
============================================================ */


/* Numerical fields */

Object.keys(ranges).forEach(fieldId => {

    const field = document.getElementById(fieldId);


    if (!field) {
        return;
    }


    field.addEventListener("input", () => {

        /*
         * Do not show "required" while the user is simply
         * typing. If they have entered something, validate it.
         */

        if (field.value.trim() !== "") {

            validateNumber(fieldId);

        } else {

            clearError(fieldId);

        }

    });

});


/* Dropdown fields */

Object.keys(selectFields).forEach(fieldId => {

    const field = document.getElementById(fieldId);


    if (!field) {
        return;
    }


    field.addEventListener("change", () => {

        if (field.value !== "") {

            clearError(fieldId);

        }

    });

});


/* ============================================================
   ENCODING FUNCTIONS
============================================================ */


/*
 * The model uses numerical values.
 * The user interface uses readable labels.
 */


/* SEX */

function encodeSex(value) {

    if (value === "Male") {
        return 1;
    }

    if (value === "Female") {
        return 0;
    }

    return null;
}


/* CHEST PAIN */

function encodeChestPain(value) {

    const mapping = {

        "Typical Angina": 0,

        "Atypical Angina": 1,

        "Non-anginal Pain": 2,

        "Asymptomatic": 3

    };

    return mapping[value];
}


/* FASTING BLOOD SUGAR */

function encodeFbs(value) {

    if (value === "Yes") {
        return 1;
    }

    if (value === "No") {
        return 0;
    }

    return null;
}


/* RESTING ECG */

function encodeRestEcg(value) {

    const mapping = {

        "Normal": 0,

        "ST-T Wave Abnormality": 1,

        "Left Ventricular Hypertrophy": 2

    };

    return mapping[value];
}


/* EXERCISE ANGINA */

function encodeExang(value) {

    if (value === "Yes") {
        return 1;
    }

    if (value === "No") {
        return 0;
    }

    return null;
}


/* ST SLOPE */

function encodeSlope(value) {

    const mapping = {

        "Upsloping": 0,

        "Flat": 1,

        "Downsloping": 2

    };

    return mapping[value];
}


/* THALASSEMIA */

function encodeThal(value) {

    const mapping = {

        "Normal": 1,

        "Fixed Defect": 2,

        "Reversible Defect": 3

    };

    return mapping[value];
}


/* ============================================================
   FORM SUBMISSION
============================================================ */

form.addEventListener("submit", async function(event) {

    event.preventDefault();


    /* --------------------------------------------------------
       VALIDATE EVERYTHING
    -------------------------------------------------------- */

    const valid = validateForm();


    if (!valid) {

        return;
    }


    /* --------------------------------------------------------
       DISABLE BUTTON
    -------------------------------------------------------- */

    submitButton.disabled = true;

    submitButton.textContent = "Assessing...";


    try {

        /* ----------------------------------------------------
           GET VALUES
        ---------------------------------------------------- */

        const patient = {

            age: Number(
                document.getElementById("age").value
            ),

            sex: encodeSex(
                document.getElementById("sex").value
            ),

            cp: encodeChestPain(
                document.getElementById("cp").value
            ),

            trestbps: Number(
                document.getElementById("trestbps").value
            ),

            chol: Number(
                document.getElementById("chol").value
            ),

            fbs: encodeFbs(
                document.getElementById("fbs").value
            ),

            restecg: encodeRestEcg(
                document.getElementById("restecg").value
            ),

            thalach: Number(
                document.getElementById("thalach").value
            ),

            exang: encodeExang(
                document.getElementById("exang").value
            ),

            oldpeak: Number(
                document.getElementById("oldpeak").value
            ),

            slope: encodeSlope(
                document.getElementById("slope").value
            ),

            ca: Number(
                document.getElementById("ca").value
            ),

            thal: encodeThal(
                document.getElementById("thal").value
            )

        };


        /* ----------------------------------------------------
           SEND TO PYTHON API
        ---------------------------------------------------- */

        const response = await fetch(
            "/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(patient)
            }
        );


        /* ----------------------------------------------------
           CHECK RESPONSE
        ---------------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                "Prediction request failed."
            );
        }


        const result = await response.json();


        console.log(
            "FULL API RESPONSE:",
            result
        );


        /* ----------------------------------------------------
           CHECK API ERROR
        ---------------------------------------------------- */

        if (result.error) {

            throw new Error(
                result.error
            );
        }


        if (result.success === false) {

            throw new Error(
                result.error ||
                "Prediction could not be completed."
            );
        }


        /* ----------------------------------------------------
           SAVE RESULT
        ---------------------------------------------------- */

        localStorage.setItem(
            "heartPredictionResult",
            JSON.stringify(result)
        );


        /* ----------------------------------------------------
           SAVE PATIENT DATA
        ---------------------------------------------------- */

        localStorage.setItem(
            "heartPatientData",
            JSON.stringify(patient)
        );


        /* ----------------------------------------------------
           GO TO RESULT PAGE
        ---------------------------------------------------- */

        window.location.href = "/result.html";

    }


    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        alert(
            error.message ||
            "Prediction could not be completed."
        );


        /* Re-enable button */

        submitButton.disabled = false;

        submitButton.textContent =
            "Assess Heart Disease Risk";

    }

});