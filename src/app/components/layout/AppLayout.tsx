import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion } from 'motion/react';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 overflow-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
