import { motion } from "framer-motion";

const Card = ({ children, className = "", onClick, whileHover, layoutId }) => {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      whileHover={whileHover}
      className={`bg-surface border border-border-subtle rounded-2xl shadow-lg overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
