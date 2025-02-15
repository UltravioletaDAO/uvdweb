import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CourseCard from "../components/CourseCard";

const Courses = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    // Animamos la salida usando framer-motion
    // La navegación será manejada por AnimatePresence en el componente padre
    navigate("/", { replace: true });
  };

  const courses = [
    {
      title: "COMO CREAR UNA BILLETERA PARA CRIPTOMONEDAS",
      description:
        "Crear una billetera para criptomonedas implica desarrollar una aplicación que permita a los usuarios almacenar, enviar y recibir activos digitales de manera segura.",
      link: "https://youtu.be/5eW5D9BteEs?si=kiHcWBjFgNHkbeIe",
      category: ["youtube"],
      thumbnail: getYoutubeThumbnail(
        "https://youtu.be/5eW5D9BteEs?si=kiHcWBjFgNHkbeIe"
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="maxs-h-screen bg-background container mx-auto py-16 px-4"
    >
      <motion.button
        onClick={handleReturn}
        className="inline-flex items-center space-x-2 text-text-secondary
            hover:text-text-primary transition-all duration-200 mb-8
            hover:translate-x-[-5px]"
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Volver al inicio</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-bold text-text-primary mb-8
									text-center"
      >
        Nuestros Cursos
      </motion.h1>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </motion.div>
    </motion.div>
  );
};

function getYoutubeThumbnail(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default Courses;
