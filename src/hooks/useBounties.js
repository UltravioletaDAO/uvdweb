import { useState, useEffect, useCallback, useMemo } from 'react';
import { bountiesAPI } from '../services/api';

// Duración de la votación en Snapshot (2 días en milisegundos)
const VOTING_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Custom hook para manejar la lógica de bounties
 * @returns {Object} Estado y funciones para manejar bounties
 */
const useBounties = () => {
  const [tasks, setTasks] = useState([]);
  const [loadingBounties, setLoadingBounties] = useState(true);
  const [fetchBountiesError, setFetchBountiesError] = useState(null);
  const [selectedBounty, setSelectedBounty] = useState(null);

  // Verificar si han pasado más de 2 días desde la expiración del bounty
  const isVotingExpired = useCallback((task) => {
    if (!task.endDate) return false;
    const endDate = new Date(task.endDate);
    const now = new Date();
    const timeSinceExpiration = now.getTime() - endDate.getTime();
    return timeSinceExpiration > VOTING_DURATION_MS;
  }, []);

  // Función para cargar bounties desde el backend
  const fetchBounties = useCallback(async () => {
    setLoadingBounties(true);
    setFetchBountiesError(null);
    try {
      const data = await bountiesAPI.getAll();
      const allBounties = data.data || data;
      // Filtrar bounties cancelados e inactivos
      const activeBounties = allBounties.filter(
        (b) => b.isActive !== false && b.status !== 'cancelled'
      );
      setTasks(activeBounties);
    } catch (err) {
      setFetchBountiesError(err.message);
    } finally {
      setLoadingBounties(false);
    }
  }, []);

  // Cargar bounties al montar el componente
  useEffect(() => {
    fetchBounties();
  }, [fetchBounties]);

  // Auto-refresh de bounties cada 2 horas
  useEffect(() => {
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const intervalId = setInterval(() => {
      fetchBounties();
    }, TWO_HOURS_MS);
    return () => clearInterval(intervalId);
  }, [fetchBounties]);

  // Actualizar selectedBounty cuando cambian las tasks
  useEffect(() => {
    if (selectedBounty) {
      const updatedBounty = tasks.find(task => task._id === selectedBounty._id);
      if (updatedBounty) {
        setSelectedBounty(updatedBounty);
      } else {
        setSelectedBounty(null);
      }
    }
  }, [tasks, selectedBounty?._id]);

  // Agrupar tareas por estado - memoizado
  const getTasksByStatus = useCallback((status) => {
    if (status === 'todo') {
      return tasks.filter((task) => task.status === 'todo');
    } else if (status === 'in_voting') {
      return tasks.filter((task) =>
        task.status === 'voting' && !isVotingExpired(task)
      );
    } else if (status === 'finished') {
      return tasks.filter((task) =>
        task.status === 'done' ||
        (task.status === 'voting' && isVotingExpired(task))
      );
    }
    return [];
  }, [tasks, isVotingExpired]);

  // Tareas agrupadas por estado (memoizado)
  const tasksByStatus = useMemo(() => ({
    todo: getTasksByStatus('todo'),
    in_voting: getTasksByStatus('in_voting'),
    finished: getTasksByStatus('finished'),
  }), [getTasksByStatus]);

  // Cerrar vista detallada del bounty
  const closeBountyDetails = useCallback(() => {
    setSelectedBounty(null);
  }, []);

  // Seleccionar un bounty
  const selectBounty = useCallback((bounty) => {
    setSelectedBounty(bounty);
  }, []);

  return {
    tasks,
    loadingBounties,
    fetchBountiesError,
    selectedBounty,
    setSelectedBounty: selectBounty,
    closeBountyDetails,
    fetchBounties,
    getTasksByStatus,
    tasksByStatus,
    isVotingExpired,
  };
};

export default useBounties;
