import Joi from 'joi';

export const validateEvaluation = (data) => {
    const schema = Joi.object({
        employee_id: Joi.number().integer().required(),
        evaluation_date: Joi.date().required(),
        evaluator_name: Joi.string().max(255).required(),
        communication_skills: Joi.number().integer().min(1).max(10).required(),
        technical_skills: Joi.number().integer().min(1).max(10).required(),
        teamwork: Joi.number().integer().min(1).max(10).required(),
        problem_solving: Joi.number().integer().min(1).max(10).required(),
        punctuality: Joi.number().integer().min(1).max(10).required(),
        responsibility: Joi.number().integer().min(1).max(10).required(),
        expertise: Joi.number().integer().min(1).max(10).required(),
        dependability: Joi.number().integer().min(1).max(10).required(),
        reliability: Joi.number().integer().min(1).max(10).required(),
        skills: Joi.number().integer().min(1).max(10).required(),
        comments: Joi.string().allow(null, '').optional(),
    });
    return schema.validate(data);
};
