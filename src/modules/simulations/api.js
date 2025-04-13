import { runSimulation } from './internal/services';
import { validateSimulationForm, validateSimulationResults } from './validators';

export const api = {
  /**
   * Run a match simulation with the provided form data
   * @param {Object} formData - The simulation form data
   * @param {Function} updateProgress - Callback function to update progress percentage
   * @returns {Promise<Object>} - The simulation results
   */
  async simulateMatch(formData, updateProgress) {
    // Validate form data
    const validatedFormData = validateSimulationForm(formData, {
      actionName: 'simulateMatch',
      direction: 'incoming',
      location: 'simulations/api.js',
      moduleFrom: 'client',
      moduleTo: 'simulations'
    });
    
    // Run simulation
    const results = await runSimulation(validatedFormData, updateProgress);
    
    // Validate results before returning
    return validateSimulationResults(results, {
      actionName: 'simulateMatch',
      direction: 'outgoing',
      location: 'simulations/api.js',
      moduleFrom: 'simulations',
      moduleTo: 'client'
    });
  }
};