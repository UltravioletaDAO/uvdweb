import { motion } from "framer-motion";

const CourseCard = ({ course }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-xl bg-background border border-ultraviolet-darker/20
          hover:border-ultraviolet-darker transition-all duration-300
          hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
          hover:bg-background/80 group flex flex-col h-full"
    >
      {course.thumbnail && (
        <a
          href={course.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden"
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-56 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
          />
        </a>
      )}
      <div className="flex-grow p-4">
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          {course.title}
        </h3>
        <p className="text-text-secondary mb-4">{course.description}</p>
      </div>
      <div className="mt-auto pt-4">
        <a
          href={course.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-ultraviolet-darker text-text-primary rounded-lg
              hover:bg-ultraviolet-dark transition-colors duration-200 w-full text-center"
        >
          Ver video
        </a>
      </div>
    </motion.div>
  );
};

export default CourseCard;
