export default function Welcome() {
    return (
        <section className="py-16 mt-20" style={{ backgroundColor: '#818589' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <h1 className="text-4xl sm:text-7xl font-extrabold text-center mb-2" style={{ color: '#D8E2D5' }}>
                    Welcome to
                </h1>
                <h1 className="text-4xl sm:text-9xl font-extrabold text-center mb-10" style={{ color: '#D8E2D5' }}>
                    Aeroponics System
                </h1>
                <p className="mt-4 text-lg text-justify" style={{ color: '#D8E2D5' }}>
                    The Aeroponics System is an innovative solution designed to address the challenges faced in modern agriculture. 
                    Using advanced technologies like NodeMCU, our system automates and monitors critical environmental factors such as temperature, humidity, pH, 
                    and nutrient levels, ensuring optimal plant growth in a soilless farming environment.
                </p>
                <div className="flex justify-center my-6">
                    <div className="w-20 h-1" style={{ backgroundColor: '#333333' }}></div>
                </div>
                <p className="text-lg text-justify" style={{ color: '#D8E2D5' }}>
                    Aeroponics offers several advantages over traditional farming methods, including faster plant 
                    growth, increased crop yields, and reduced water consumption. By suspending plant roots in the 
                    air and misting them with a nutrient-rich solution, plants receive the perfect amount of oxygen 
                    and nutrients for optimal growth.
                </p>
                <p className="mt-4 text-lg text-justify"style={{ color: '#D8E2D5' }}>
                    <span className="font-semibold" style={{ color: '#D8E2D5' }}>Why Choose Our Aeroponics System?</span>
                </p>
                <ul className="mt-2 text-lg text-justify list-disc list-inside"style={{ color: '#D8E2D5' }}>
                    <li className="mb-2"><span className="font-bold"style={{ color: '#D8E2D5' }}>Efficiency & Automation:</span> Automated control of environmental factors reduces labor and minimizes human error.</li>
                    <li className="mb-2"><span className="font-bold"style={{ color: '#D8E2D5' }}>Sustainability:</span> Reduced water usage, minimized pesticide use, and sustainable farming practices contribute to environmental conservation.</li>
                    <li className="mb-2"><span className="font-bold"style={{ color: '#D8E2D5' }}>Real-Time Monitoring:</span> Remote IoT-based monitoring provides real-time data on system performance and alerts users about potential issues such as low water levels or pH imbalances.</li>
                    <li className="mb-2"><span className="font-bold"style={{ color: '#D8E2D5' }}>Smart Farming:</span> Integration of IoT and NodeMCU enhances automation, allowing farmers to remotely manage and monitor their aeroponic systems.</li>
                </ul>
                <p className="mt-6 text-lg text-justify"style={{ color: '#D8E2D5' }}>
                    Join the future of farming and increase your crop yields with our Aeroponics System. Our automated solutions aim to reduce environmental impact while maximizing efficiency in crop production.
                </p>
            </div>
        </section>
    );
}
