import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"               element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/products"       element={<ProductList />} />
        <Route path="/products/new"   element={<ProductForm />} />
        <Route path="/products/:id"   element={<ProductForm />} />
      </Routes>
    </Layout>
  );
}
