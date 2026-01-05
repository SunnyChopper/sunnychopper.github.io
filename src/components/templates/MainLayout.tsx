import { Outlet } from 'react-router-dom';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
