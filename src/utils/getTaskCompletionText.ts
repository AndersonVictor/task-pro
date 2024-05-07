/**
 * Returns a task completion message based on the completion percentage.
 * @param {number} completionPercentage - The completion percentage of tasks.
 * @returns {string} A task completion message.
 */
export const getTaskCompletionText = (completionPercentage: number): string => {
  switch (true) {
    case completionPercentage === 0:
      return "Aún no se ha completado ninguna tarea. Sigue adelante!!";
    case completionPercentage === 100:
      return "¡Enhorabuena! Todas las tareas completadas!";
    case completionPercentage >= 75:
      return "¡Ya casi!";
    case completionPercentage >= 50:
      return "¡Estás a mitad de camino! Sigue así!";
    case completionPercentage >= 25:
      return "Estás progresando bien";
    default:
      return "Acabas de empezar";
  }
};
