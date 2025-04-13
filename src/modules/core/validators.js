import * as Sentry from '@sentry/browser';

/**
 * Creates a validator function for the given schema
 * @param {Object} schema - Validation schema
 * @param {string} contextName - Name of what's being validated (e.g., 'Simulation', 'Result')
 * @returns {function} - Enhanced validator function with additional context options
 */
export const createValidator = (schema, contextName) => {
  /**
   * Validates data against the schema
   * @param {any} data - Data to validate
   * @param {Object} options - Additional validation context
   * @returns {any} - The validated data
   */
  return (data, options = {}) => {
    const {
      actionName = 'unknown',
      location = 'unknown',
      moduleFrom = 'unknown',
      moduleTo = 'unknown'
    } = options;
    
    try {
      // Basic validation logic
      // In a real implementation, this would use a validation library like Zod
      if (!data) {
        throw new Error('Data is required');
      }
      
      // Check that data conforms to schema (simplified)
      for (const key in schema) {
        if (schema[key].required && (data[key] === undefined || data[key] === null)) {
          throw new Error(`${key} is required`);
        }
      }
      
      return data;
    } catch (error) {
      // Log validation error
      const errorMessage = `Validation failed in ${actionName} (${moduleFrom} → ${moduleTo})\nContext: ${contextName}\nLocation: ${location}\nError: ${error.message}`;
      
      console.error(errorMessage);
      
      // Send to Sentry
      Sentry.captureException(error, {
        extra: {
          context: contextName,
          action: actionName,
          location,
          moduleFlow: `${moduleFrom}-to-${moduleTo}`,
          receivedData: JSON.stringify(data)
        }
      });
      
      throw new Error(errorMessage);
    }
  };
};