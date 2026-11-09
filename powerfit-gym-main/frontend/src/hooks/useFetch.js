import { useState, useEffect, useCallback } from 'react';

export function useFetch(asyncFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || 'Error desconocido al procesar la petición.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    execute();
    
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
