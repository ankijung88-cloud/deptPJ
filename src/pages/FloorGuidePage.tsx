import React from 'react';
import { FloorGuideSection } from '../components/home/FloorGuideSection';
import { motion } from 'framer-motion';

const FloorGuidePage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20"
        >
            <FloorGuideSection />
        </motion.div>
    );
};

export default FloorGuidePage;
