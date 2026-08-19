/**
 * Minimalist Backend Input Validation Middleware
 */

const validate = (schema) => (req, res, next) => {
    const body = req.body;
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
        const val = body[key];

        // Required check
        if (rules.required && (val === undefined || val === null || val === '')) {
            errors.push(`${key} kiritilishi shart`);
            continue;
        }

        // Type check
        if (val !== undefined && rules.type) {
            if (rules.type === 'number' && isNaN(Number(val))) {
                errors.push(`${key} raqam bo'lishi kerak`);
            } else if (rules.type === 'string' && typeof val !== 'string') {
                errors.push(`${key} matn bo'lishi kerak`);
            } else if (rules.type === 'array' && !Array.isArray(val)) {
                errors.push(`${key} ro'yxat (array) bo'lishi kerak`);
            }
        }

        // Min length
        if (val && rules.min && String(val).length < rules.min) {
            errors.push(`${key} kamida ${rules.min} belgidan iborat bo'lsin`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Ma\'lumotlar xato', errors });
    }

    next();
};

module.exports = { validate };
