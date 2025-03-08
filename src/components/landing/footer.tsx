export default function Footer() {
    return (
        <footer className="bg-red-800 text-white py-4 px-3 w-full flex flex-col md:flex-row">
            <div className="container mx-auto flex flex-wrap items-center justify-between">
                <div className="w-full md:w-auto md:mb-0 mb-8 text-left">
                    <p className="text-xs md:text-sm">Copyright 2025 &copy; All Rights Reserved.</p>
                </div>
                <div className="w-full md:w-auto md:mb-0 mb-8 text-right">
                    <ul className="list-reset flex justify-end flex-wrap text-xs md:text-sm gap-3">
                        <li><a href="#" className="hover:text-white">Contact</a></li>
                        <li className="mx-4"><a href="#" className="hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white">Terms of Use</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
