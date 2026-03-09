import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LiveShortsSection } from '../components/home/LiveShortsSection';

const LiveShortsPage: React.FC = () => {
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
            <LiveShortsSection />
        </motion.div>
    );
};

export default LiveShortsPage;
