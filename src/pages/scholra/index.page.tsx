import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/layouts/Layout';
import SEO from '@/components/SEO';
import ScholraFlow from '../scholarship-recommendation/components/ScholraFlow';
import withAuth from '@/components/hoc/withAuth';
import Typography from '@/components/Typography';
import { FiZap, FiTarget, FiDatabase, FiAward } from 'react-icons/fi';

const ScholraTestingPage = () => {
    return (
        <Layout withNavbar withFooter>
            <SEO
                title="Scholra Guide - Smart Scholarship Recommendation | Raihasa"
                description="Temukan beasiswa yang paling cocok dengan profil akademik dan kondisimu menggunakan Scholra Guide."
            />

            <main className="min-h-screen bg-[#FDFEFE] py-20 px-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto mb-16 text-center">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B7691]/5 to-transparent px-6 py-2 rounded-full mb-8 border border-[#1B7691]/10"
                        >
                             <FiZap className="text-[#FB991A] animate-pulse" />
                             <span className="text-[10px] font-black text-[#1B7691] uppercase tracking-[0.3em]">AI-Driven Analytics</span>
                        </motion.div>
                        
                        <Typography className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter">
                            The Smartest Way to <br/>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1B7691] to-[#0d5a6e]">Find Scholarships</span>
                        </Typography>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-12">
                            Mulai konsultasi dengan Scholra dan biarkan teknologi kami mencocokkan profilmu dengan kesempatan terbaik di seluruh dunia.
                        </p>
                    </div>

                    {/* The Interactive Flow Area */}
                    <div className="mb-10">
                        <ScholraFlow />
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default withAuth(ScholraTestingPage, 'user');
