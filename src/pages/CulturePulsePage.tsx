import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarEventsCombinedSection } from '../components/home/CalendarEventsCombinedSection';

const CulturePulsePage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20"
        >
            <CalendarEventsCombinedSection />
        </motion.div>
    );
};

export default CulturePulsePage;
