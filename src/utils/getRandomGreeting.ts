/**
 * Returns a random greeting message to inspire productivity.
 * @returns {string} A random greeting message with optional emoji code.
 */
export const getRandomGreeting = (): string => {
  const hoursLeft = 24 - new Date().getHours();

  const greetingsText: string[] = [
    "¡Hagamos que hoy cuente! **1f680**",
    "¡Haz las cosas y conquista el día!",
    "¡Abraza el poder de la productividad!",
    "Fija tus objetivos, aplástalos, repite",
    "¡Hoy es una nueva oportunidad para ser productivo!",
    "Haz que cada momento cuente",
    "Organízate, adelántate",
    "¡Toma las riendas de tu día!",
    "Una tarea cada vez, ¡tú puedes!",
    "La productividad es la clave del éxito. **1f511**",
    "¡Convirtamos los planes en logros!",
    "Empieza poco a poco, consigue mucho",
    "Sé eficiente, sé productivo",
    "¡Aprovecha el poder de la productividad!",
    "¡Prepárate para hacer que las cosas sucedan!",
    "¡Es hora de tachar esas tareas! **2705**",
    "¡Empieza el día con un plan! **1f5d3-fe0f**",
    "Mantente concentrado, mantente productivo",
    "Libera tu potencial de productividad. **1f513**",
    "¡Convierte tu lista de tareas en una lista de cosas por hacer! **1f4dd**",

    `Que tengas un maravilloso ${new Date().toLocaleDateString("en", {
      weekday: "long",
    })}!`,
    `Feliz ${new Date().toLocaleDateString("es", {
      month: "long",
    })}! Un gran mes para la productividad!`,
    hoursLeft > 4
      ? `${hoursLeft} horas que quedan en el día. ¡Utilízalas sabiamente!`
      : `Only ${hoursLeft} horas restantes del día`,
  ];

  const randomIndex = Math.floor(Math.random() * greetingsText.length);
  return greetingsText[randomIndex];
};
