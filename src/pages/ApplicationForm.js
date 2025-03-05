import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import SuccessMessage from '../components/SuccessMessage';
import { useTranslation } from 'react-i18next';

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
    story: '',
    purpose: '',
    references: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { t } = useTranslation();

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
    
    // Si es twitter o telegram, asegurarse que tenga @
    if ((name === 'twitter' || name === 'telegram') && value.trim() !== '') {
      const formattedValue = value.startsWith('@') ? value : `@${value}`;
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
          error = t('form.validation.email_required');
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = t('form.validation.email_format');
        }
        break;
      
      case 'twitter':
        if (!value) {
          error = t('form.validation.social_required', { social: name });
        }
        break;
      
      case 'telegram':
        if (!value) {
          error = t('form.validation.social_required', { social: name });
        } else {
          // Remover el @ si existe para validar el primer carácter
          const username = value.startsWith('@') ? value.substring(1) : value;
          if (/^\d/.test(username)) {
            error = t('form.validation.telegram_format');
          }
        }
        break;
      
      case 'walletAddress':
        if (!value) {
          error = t('form.validation.wallet_required');
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          error = t('form.validation.wallet_format');
        }
        break;
      
      case 'story':
      case 'purpose':
        if (!value.trim()) {
          error = t(`form.validation.${name}_required`);
        } else if (value.length < 55) {
          error = t(`form.validation.${name}_length`, { current: value.length });
        } else if (value.length > 2584) {
          error = t(`form.validation.${name}_too_long`, { max: 2584, current: value.length });
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
      3: ['walletAddress', 'story', 'purpose']
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
        throw new Error(t('form.errors.api_url_missing'));
      }

      console.log('Enviando datos al servidor:', `${apiUrl}/apply`); // Debug

      // Añadir timestamp al formData
      const now = new Date();
      const dataToSend = {
        ...formData,
        timestamp: Math.floor(now.getTime() / 1000) // Unix timestamp en segundos
      };

      const response = await fetch(`${apiUrl}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
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
          throw new Error(t('form.errors.endpoint_not_found'));
        }
        if (response.status === 500) {
          throw new Error(t('form.errors.server_error'));
        }
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.message || t('form.errors.data_error'));
        }
      }

      // Verificar el tipo de contenido
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Tipo de contenido inesperado:', contentType); // Debug
        throw new Error(t('form.errors.unexpected_response'));
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
          story: '',
          purpose: '',
          references: ''
        });
        setCurrentStep(1);
      } else {
        throw new Error(data.message || t('form.errors.processing_error'));
      }
      
    } catch (error) {
      console.error('Error detallado:', error); // Debug

      // Mensajes de error más específicos
      let errorMessage = t('form.errors.submit_error');
      
      // Errores de red
      if (error.message === 'Failed to fetch') {
        errorMessage += t('form.errors.network_error');
      } else {
        errorMessage += error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado del botón de envío con estado de carga
  const renderSubmitButton = () => (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300
        ${isSubmitting 
          ? 'bg-ultraviolet-dark cursor-not-allowed' 
          : 'bg-ultraviolet-darker hover:bg-ultraviolet-dark'
        }`}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('form.buttons.submitting')}
        </div>
      ) : (
        t('form.buttons.submit')
      )}
    </button>
  );

  // Renderizado del mensaje de error
  const renderSubmitError = () => submitError && (
    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
      <p>{submitError}</p>
    </div>
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

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Eliminar currentStep de las dependencias

  const handleKeyDown = (e) => {
    // Si presiona Enter y no es un textarea
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < 3) {
        nextStep();
      } else if (!isSubmitting) {
        handleSubmit(e);
      }
    }
  };

  // Renderizado del contenido del formulario según el paso actual
  const renderStep = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-text-primary">
              {t('form.steps.personal')}
            </h3>
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <FormField
                label={t('form.fields.fullName')}
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fullName && errors.fullName}
                placeholder={t('form.placeholders.fullName')}
                tabIndex={1}
              />
              <FormField
                label={t('form.fields.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                placeholder={t('form.placeholders.email')}
                tabIndex={2}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-text-primary">
              {t('form.steps.social')}
            </h3>
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <FormField
                label={t('form.fields.twitter')}
                name="twitter"
                type="text"
                value={formData.twitter}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.twitter && errors.twitter}
                placeholder={t('form.placeholders.twitter')}
                tabIndex={1}
              />
              <FormField
                label={t('form.fields.telegram')}
                name="telegram"
                type="text"
                value={formData.telegram}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.telegram && errors.telegram}
                placeholder={t('form.placeholders.telegram')}
                tabIndex={2}
              />
              <FormField
                label={t('form.fields.twitch')}
                name="twitch"
                type="text"
                value={formData.twitch}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.twitch && errors.twitch}
                placeholder={t('form.placeholders.twitch')}
                optional={true}
                tabIndex={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-text-primary">
              {t('form.steps.experience')}
            </h3>
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <FormField
                label={t('form.fields.walletAddress')}
                name="walletAddress"
                type="text"
                value={formData.walletAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.walletAddress && errors.walletAddress}
                placeholder={t('form.placeholders.walletAddress')}
                tabIndex={1}
              />
              <FormField
                label={t('form.fields.story')}
                name="story"
                type="textarea"
                value={formData.story}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.story && errors.story}
                placeholder={t('form.placeholders.story')}
                rows={4}
                maxLength={2584}
                tabIndex={2}
              />
              <FormField
                label={t('form.fields.purpose')}
                name="purpose"
                type="textarea"
                value={formData.purpose}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.purpose && errors.purpose}
                placeholder={t('form.placeholders.purpose')}
                rows={4}
                maxLength={2584}
                tabIndex={3}
              />
              <FormField
                label={t('form.fields.references')}
                name="references"
                type="text"
                value={formData.references}
                onChange={handleChange}
                placeholder={t('form.placeholders.references')}
                optional={true}
                tabIndex={4}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-ultraviolet-darker/50 rounded-lg
                text-text-primary hover:bg-ultraviolet-darker/10 transition-colors"
              tabIndex={currentStep === 1 ? 3 : currentStep === 2 ? 4 : 5}
            >
              {t('form.buttons.prev')}
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-ultraviolet-darker text-text-primary rounded-lg
                hover:bg-ultraviolet-dark transition-colors"
              tabIndex={currentStep === 1 ? 3 : 4}
            >
              {t('form.buttons.next')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300
                ${isSubmitting 
                  ? 'bg-ultraviolet-dark cursor-not-allowed' 
                  : 'bg-ultraviolet-darker hover:bg-ultraviolet-dark'
                }`}
              tabIndex={5}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('form.buttons.submitting')}
                </div>
              ) : (
                t('form.buttons.submit')
              )}
            </button>
          )}
        </div>
        
        {currentStep === 3 && renderSubmitError()}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('form.title')}
      subtitle={t('form.subtitle')}
    >
      {showSuccess ? (
        <SuccessMessage onClose={onClose} />
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <ProgressBar />
          {renderStep()}
        </form>
      )}
    </Modal>
  );
};

export default ApplicationForm; 