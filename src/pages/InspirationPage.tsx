import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { VirtualStore3D } from '../components/home/VirtualStore3D';

const InspirationPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen bg-black"
        >
            <VirtualStore3D />
        </motion.div>
    );
};

export default InspirationPage;
