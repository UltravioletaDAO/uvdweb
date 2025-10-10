import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import streamSummariesService from '../services/streamSummaries';

/**
 * Hook to fetch stream summaries index data
 * Returns list of all stream summaries with metadata
 */
export function useStreamSummariesIndex() {
  return useQuery({
    queryKey: ['streamSummaries', 'index'],
    queryFn: () => streamSummariesService.fetchIndex(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch paginated stream summaries
 * @param {number} page - Current page number (1-indexed)
 * @param {number} perPage - Items per page
 */
export function useStreamSummariesPaginated(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ['streamSummaries', 'paginated', page, perPage],
    queryFn: () => streamSummariesService.fetchPaginatedSummaries(page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Keep previous page data while loading next page
  });
}

/**
 * Hook to fetch a specific stream summary by streamer name, video ID, and date from S3
 * @param {string} streamer - Streamer username (e.g., '0xultravioleta')
 * @param {string} videoId - Twitch video ID
 * @param {string} fechaStream - Stream date in YYYYMMDD format
 * @param {boolean} enabled - Whether to fetch the data (useful for lazy loading)
 */
export function useStreamSummary(streamer, videoId, fechaStream, enabled = false) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Update service language when it changes
  React.useEffect(() => {
    streamSummariesService.setLanguage(currentLanguage);
  }, [currentLanguage]);

  return useQuery({
    queryKey: ['streamSummaries', 'detail', streamer, videoId, fechaStream, currentLanguage],
    queryFn: () => streamSummariesService.fetchSummary(streamer, videoId, fechaStream),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!streamer && !!videoId && !!fechaStream && enabled, // Only fetch when enabled and all params exist
  });
}

/**
 * Hook to fetch summaries filtered by streamer
 * @param {string} streamer - Streamer username
 * @param {boolean} enabled - Whether to fetch the data
 */
export function useStreamSummariesByStreamer(streamer, enabled = true) {
  return useQuery({
    queryKey: ['streamSummaries', 'byStreamer', streamer],
    queryFn: () => streamSummariesService.fetchByStreamer(streamer),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!streamer && enabled,
  });
}
