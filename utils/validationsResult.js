const { validationResult } = require('express-validator');

module.exports.validationResult = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ message: 'Uncorrect request', errors });
    }
}
