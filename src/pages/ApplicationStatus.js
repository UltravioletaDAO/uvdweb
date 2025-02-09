import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const ApplicationStatus = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusConfig = {
    pending: {
      icon: ClockIcon,
      title: 'Aplicación en Espera',
      description: 'Tu aplicación ha sido recibida y está pendiente de revisión.',
      color: 'text-yellow-400'
    },
    review: {
      icon: DocumentMagnifyingGlassIcon,
      title: 'En Revisión',
      description: 'Tu aplicación está siendo evaluada por nuestro equipo.',
      color: 'text-blue-400'
    },
    approved: {
      icon: CheckCircleIcon,
      title: '¡Aprobado!',
      description: '¡Felicidades! Tu aplicación ha sido aprobada.',
      color: 'text-green-400'
    },
    waitlist: {
      icon: ClockIcon,
      title: 'En Lista de Espera',
      description: 'Has sido colocado en nuestra lista de espera prioritaria.',
      color: 'text-purple-400'
    },
    rejected: {
      icon: XMarkIcon,
      title: 'No Aprobado',
      description: 'Lo sentimos, tu aplicación no ha sido aprobada en este momento.',
      color: 'text-red-400'
    }
  };

  const checkStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = `${process.env.REACT_APP_API_URL}/apply/status/${email}`;
      console.log('Intentando conectar a:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Respuesta del servidor:', response.status);
      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al consultar el estado');
      }

      setStatus(data.data);
    } catch (error) {
      console.error('Error completo:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para formatear la fecha en DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 porque los meses van de 0 a 11
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const StatusDisplay = ({ status }) => {
    const config = statusConfig[status.status];
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-lighter p-8 rounded-xl border border-ultraviolet-darker/20
          shadow-lg shadow-black/20"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="p-4 bg-background/50 rounded-full">
            <Icon className={`w-16 h-16 ${config.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">{config.title}</h2>
          <p className="text-text-secondary text-center">{config.description}</p>
          {status.message && (
            <p className="text-ultraviolet mt-4 text-center font-medium">{status.message}</p>
          )}
          <div className="w-full h-px bg-ultraviolet-darker/20" />
          <p className="text-text-secondary text-sm">
            Última actualización: {formatDate(status.updatedAt)}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-text-secondary
            hover:text-text-primary transition-all duration-200
            group"
        >
          <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 
            transition-transform duration-200" />
          <span>Volver al inicio</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-text-primary
            [text-shadow:_0_0_10px_rgba(106,0,255,0.2)]">
            Estado de tu Aplicación
          </h1>
          <p className="text-text-secondary">
            Ingresa el email con el que aplicaste para verificar el estado
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={checkStatus}
          className="space-y-4"
        >
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-background-input border rounded-lg
                focus:ring-2 focus:ring-ultraviolet focus:border-transparent
                border-ultraviolet-darker text-text-primary placeholder-text-secondary
                hover:border-ultraviolet transition-colors duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ultraviolet-darker text-text-primary rounded-lg
              hover:bg-ultraviolet-dark transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-ultraviolet-darker/20
              transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white
                  rounded-full animate-spin mr-2" />
                Consultando...
              </div>
            ) : (
              'Verificar Estado'
            )}
          </button>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-error text-center bg-error/10 p-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {status && <StatusDisplay status={status} />}
      </div>
    </div>
  );
};

export default ApplicationStatus; 