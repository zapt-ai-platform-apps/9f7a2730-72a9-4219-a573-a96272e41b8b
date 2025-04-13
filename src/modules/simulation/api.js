import { eventBus } from '@/modules/core/events';
import { events } from './events';
import { validateSimulationInput, validateSimulationResult, validateAccessCode } from './validators';
import { runSimulation } from './internal/services';
import { verifyAccessCode } from './internal/utils';

/**
 * Simulation API for external modules
 */
export const api = {
  /**
   * Request access code verification
   * @param {Function} onCodeRequested - Callback for when code is requested
   * @returns {Promise} - Promise resolving with true if user should enter code
   */
  requestAccessCode(onCodeRequested) {
    return new Promise((resolve) => {
      eventBus.publish(events.ACCESS_CODE_REQUIRED, { onCodeRequested });
      resolve(true);
    });
  },
  
  /**
   * Verify access code
   * @param {string} code - Access code to verify
   * @returns {Promise} - Promise resolving with verification result
   */
  async verifyAccessCode(code) {
    // Validate code structure
    validateAccessCode(
      { code }, 
      { 
        actionName: 'verifyAccessCode', 
        location: 'simulation/api.js', 
        moduleFrom: 'client', 
        moduleTo: 'simulation'
      }
    );
    
    const isValid = verifyAccessCode(code);
    
    if (isValid) {
      eventBus.publish(events.ACCESS_CODE_VERIFIED, { code });
    } else {
      eventBus.publish(events.ACCESS_CODE_REJECTED, { code });
    }
    
    return isValid;
  },
  
  /**
   * Run a simulation
   * @param {Object} formData - Simulation parameters
   * @param {Function} updateProgress - Progress update callback
   * @returns {Promise} - Promise resolving with simulation results
   */
  async simulate(formData, updateProgress) {
    try {
      // Validate input
      validateSimulationInput(
        formData, 
        { 
          actionName: 'simulate', 
          location: 'simulation/api.js', 
          moduleFrom: 'client', 
          moduleTo: 'simulation'
        }
      );
      
      eventBus.publish(events.SIMULATION_STARTED, { formData });
      
      // Run simulation
      const result = await runSimulation(formData, updateProgress);
      
      // Validate output
      validateSimulationResult(
        result, 
        { 
          actionName: 'simulate', 
          location: 'simulation/api.js', 
          moduleFrom: 'simulation', 
          moduleTo: 'client'
        }
      );
      
      eventBus.publish(events.SIMULATION_COMPLETED, { result });
      
      return result;
    } catch (error) {
      eventBus.publish(events.SIMULATION_FAILED, { error });
      throw error;
    }
  }
};