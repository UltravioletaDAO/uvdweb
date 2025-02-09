import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import SuccessMessage from '../components/SuccessMessage';

const ApplicationForm = ({ isOpen, onClose }) => {
  // Estado para manejar los pasos del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    twitter: '',
    telegram: '',
    twitch: '',
    walletAddress: '',
    experience: '',
    references: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Variantes de animación para los pasos
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Componente de barra de progreso con animación fluida
  const ProgressBar = () => {
    const progressRef = React.useRef(null);

    React.useEffect(() => {
      if (progressRef.current) {
        // Aplicamos la transición solo cuando cambia el paso
        progressRef.current.style.transition = 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)';
        progressRef.current.style.transform = `scaleX(${currentStep / 3})`;
      }
    }, [currentStep]); // Solo se ejecuta cuando cambia el paso

    return (
      <div className="w-full bg-background/50 rounded-full h-2 mb-8 overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-ultraviolet-darker to-ultraviolet rounded-full origin-left"
          style={{
            transform: 'scaleX(0)', // Posición inicial
          }}
        />
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar el error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          error = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'El email debe tener un formato válido';
        }
        break;
      
      case 'twitter':
      case 'telegram':
        if (!value) {
          error = `El usuario de ${name} es requerido`;
        } else if (!value.startsWith('@')) {
          error = `El usuario de ${name} debe comenzar con @`;
        }
        break;
      
      case 'walletAddress':
        if (!value) {
          error = 'La dirección de wallet es requerida';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          error = 'La dirección de wallet debe ser válida';
        }
        break;
      
      case 'experience':
        if (!value.trim()) {
          error = 'La experiencia es requerida';
        } else if (value.length < 55) {
          error = `Mínimo 55 caracteres (actual: ${value.length})`;
        }
        break;
      
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  // Validación del paso actual
  const validateStep = (step) => {
    const fieldsToValidate = {
      1: ['fullName', 'email'],
      2: ['twitter', 'telegram', 'twitch'],
      3: ['walletAddress', 'experience']
    }[step];

    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });

    return isValid;
  };

  // Función mejorada para el cambio de paso
  const handleStepChange = (direction) => {
    // Validamos antes de cambiar el paso
    if (direction === 'next' && !validateStep(currentStep)) {
      return;
    }

    // Calculamos el nuevo paso
    const newStep = direction === 'next' 
      ? Math.min(currentStep + 1, 3)
      : Math.max(currentStep - 1, 1);

    // Actualizamos el paso con una única actualización de estado
    setCurrentStep(newStep);
  };

  // Actualizamos las funciones de navegación
  const nextStep = () => handleStepChange('next');
  const prevStep = () => handleStepChange('prev');

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Verificar que la URL del API esté configurada
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('La URL del servidor no está configurada');
      }

      console.log('Enviando datos al servidor:', `${apiUrl}/apply`); // Debug

      const response = await fetch(`${apiUrl}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Log de la respuesta para debug
      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Manejar errores HTTP
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No se encontró el endpoint del servidor');
        }
        if (response.status === 500) {
          throw new Error('Error interno del servidor');
        }
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.message || 'Error en los datos enviados');
        }
      }

      // Verificar el tipo de contenido
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Tipo de contenido inesperado:', contentType); // Debug
        throw new Error('Respuesta inesperada del servidor');
      }

      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          twitter: '',
          telegram: '',
          twitch: '',
          walletAddress: '',
          experience: '',
          references: ''
        });
        setCurrentStep(1);
      } else {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }
      
    } catch (error) {
      console.error('Error detallado:', error); // Debug

      // Mensajes de error más específicos
      let errorMessage = 'Error al enviar el formulario. ';
      
      if (!navigator.onLine) {
        errorMessage = 'No hay conexión a internet. Por favor, verifica tu conexión.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor esté en funcionamiento.';
      } else if (error.message === 'La URL del servidor no está configurada') {
        errorMessage = 'Error de configuración del servidor. Contacta al administrador.';
      } else {
        errorMessage += error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado del botón de envío
  const renderSubmitButton = () => (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      className={`w-full py-3 px-6 rounded-lg text-white font-medium
        transition-all duration-200 ${
          isSubmitting 
            ? 'bg-ultraviolet-darker/50 cursor-not-allowed'
            : 'bg-ultraviolet hover:bg-ultraviolet-darker'
        }`}
      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white
            rounded-full animate-spin mr-2" />
          Enviando...
        </div>
      ) : (
        'Enviar solicitud'
      )}
    </motion.button>
  );

  // Mensaje de error del envío
  const renderSubmitError = () => submitError && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-sm mt-2 text-center"
    >
      {submitError}
    </motion.div>
  );

  // Efecto para manejar el scroll del body
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      
      // Bloquear el scroll y mantener la posición
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Recuperar la posición del scroll y desbloquear
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Renderizado condicional basado en el estado de éxito
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <SuccessMessage onClose={onClose} />
      </Modal>
    );
  }

  // Renderizado del paso actual con animaciones
  const renderStep = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Datos Personales</h2>
            
            <FormField
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
              placeholder="Tu nombre completo"
            />

            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Redes Sociales</h2>
            
            <FormField
              label="Twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.twitter}
              touched={touched.twitter}
              required
              placeholder="@usuario"
            />

            <FormField
              label="Telegram"
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telegram}
              touched={touched.telegram}
              required
              placeholder="@usuario"
            />

            <FormField
              label="Twitch (opcional)"
              name="twitch"
              value={formData.twitch}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.twitch}
              touched={touched.twitch}
              placeholder="usuario"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Experiencia y Wallet</h2>
            
            <FormField
              label="Dirección de Wallet"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.walletAddress}
              touched={touched.walletAddress}
              required
              placeholder="0x..."
            />

            <div className="space-y-1">
              <label htmlFor="experience" className="block text-sm font-medium text-text-primary">
                Experiencia Previa y ¿Por qué deberías ser aceptado? <span className="text-error">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="4"
                  className={`
                    w-full px-4 py-3 bg-background-input border rounded-lg
                    focus:ring-2 focus:ring-ultraviolet focus:border-transparent
                    ${errors.experience ? 'border-error' : 'border-ultraviolet-darker'}
                    text-text-primary placeholder-text-secondary
                    resize-none
                  `}
                  placeholder="Cuéntanos sobre tu experiencia y por qué quieres unirte..."
                  required
                />
              </div>
              {(errors.experience || (formData.experience && formData.experience.length < 55)) && (
                <p className="text-sm text-error mt-1">
                  {errors.experience || `Mínimo 55 caracteres (actual: ${formData.experience.length})`}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="references" className="block text-sm font-medium text-text-primary">
                Referencias <span className="text-text-secondary">(opcional)</span>
              </label>
              <textarea
                id="references"
                name="references"
                value={formData.references}
                onChange={handleChange}
                rows="3"
                className={`
                  w-full px-4 py-3 bg-background-input border rounded-lg
                  focus:ring-2 focus:ring-ultraviolet focus:border-transparent
                  border-ultraviolet-darker
                  text-text-primary placeholder-text-secondary
                  resize-none
                `}
                placeholder="¿Alguien te recomendó?"
              />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-background-lighter shadow-2xl shadow-black/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.2,
            duration: 0.4,
            ease: "easeOut"
          }}
          className="p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2
            [text-shadow:_0_0_10px_rgba(106,0,255,0.2)]"
          >
            Formulario de Postulación
          </h1>
          <p className="text-text-secondary mb-8">
            Únete a nuestra comunidad y sé parte del futuro de Web3
          </p>

          <ProgressBar />

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStep()}
            
            <div className="flex justify-between pt-6 border-t border-ultraviolet-darker/20">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 border border-ultraviolet-darker rounded-lg 
                    text-text-primary bg-background/30
                    hover:bg-background/50 hover:border-ultraviolet
                    transition-all duration-200"
                >
                  Anterior
                </motion.button>
              )}
              
              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto px-6 py-2 bg-ultraviolet-darker text-text-primary 
                    rounded-lg hover:bg-ultraviolet-dark transition-all duration-200
                    shadow-lg shadow-ultraviolet-darker/20"
                >
                  Siguiente
                </motion.button>
              ) : (
                <div className="ml-auto space-y-4">
                  {renderSubmitButton()}
                  {renderSubmitError()}
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ApplicationForm; 