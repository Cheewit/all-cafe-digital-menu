import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { GEOJSON_URL } from '../constants';
import { fetchJSON } from '../services/api';
import { GeoJSONData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProvinceMapProps {
  byProvince: { [province: string]: number };
}

const ProvinceMap: React.FC<ProvinceMapProps> = ({ byProvince }) => {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        setError(null);
        const data = await fetchJSON<GeoJSONData>(GEOJSON_URL, { timeoutMs: 15000 });
        if (data && data.features) {
          setGeoData(data);
        } else {
          throw new Error("Invalid GeoJSON format received from source.");
        }
      } catch (e: any) {
        setError(`Failed to load map data: ${e.message}`);
      }
    };
    loadGeoData();
  }, []);

  const mapProvinceNames = useMemo(() => {
    if (!geoData) return new Set<string>();
    const provinceSet = new Set<string>();
    geoData.features.forEach((feature: any) => {
      const name = (feature.properties?.name || '').trim(); // Use English name
      if (name) provinceSet.add(name);
    });
    return provinceSet;
  }, [geoData]);

  const unmatchedKeys = useMemo(() => {
    return Object.keys(byProvince).filter(key => key !== 'Unknown Province' && key !== 'ไม่ทราบจังหวัด' && !mapProvinceNames.has(key));
  }, [byProvince, mapProvinceNames]);

  const maxCount = useMemo(() => {
    const counts = Object.values(byProvince);
    return counts.length > 0 ? Math.max(...counts.map(v => Number(v))) : 0;
  }, [byProvince]);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(100, 116, 139, 0.2)';
    if (maxCount === 0) return 'hsl(188, 80%, 40%)';

    const intensity = Math.pow(count / maxCount, 0.5);
    const startL = 25, endL = 60, startS = 60, endS = 90;
    const l = startL + (endL - startL) * intensity;
    const s = startS + (endS - startS) * intensity;
    return `hsl(188, ${s}%, ${l}%)`;
  };

  if (error) {
     return <div className="h-[500px] flex items-center justify-center text-red-400">{error}</div>;
  }
  
  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
            <p className="mt-3 text-slate-400">{t('loadingGeo')}</p>
        </div>
      </div>
    );
  }

  const style = (feature: any) => {
    const name = (feature.properties?.name || '').trim(); // Use English name
    const count = Number(byProvince?.[name] || 0);
    return {
      color: '#22d3ee',
      weight: 0.8,
      fillOpacity: 0.8,
      fillColor: getColor(count),
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = (feature.properties?.name || '').trim(); // Use English name
    const count = Number(byProvince[name] || 0);
    
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 2, color: '#f1f5f9' });
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        e.target.setStyle({ weight: 0.8, color: '#22d3ee', fillColor: getColor(count) });
      },
    });

    const tooltipContent = `<div class="font-sans">
        <strong class="text-slate-100">${name}</strong>
        <br/>
        <span class="font-mono text-cyan-300">${count.toLocaleString()} ${t('orders')}</span>
    </div>`;
    layer.bindTooltip(tooltipContent, {
        direction: 'top', sticky: true, opacity: 1, className: 'custom-leaflet-tooltip'
    });
    
    if (count > 0) {
      layer.bindTooltip(name, {
        permanent: true, direction: 'center', className: 'province-label', interactive: false,
      });
    }
  };

  return (
    <div>
        <div className="mb-2">
            <h3 className="text-base font-semibold leading-6 text-slate-100">{t('geoOrderDist')}</h3>
            <p className="mt-1 text-sm text-slate-400 font-mono">{t('geoOrderDistSub')}</p>
        </div>

        <div className="mb-2 flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-2 font-mono">{t('legend')}</span>
            <span className="inline-block w-4 h-4 rounded" style={{background:'rgba(100,116,139,0.2)'}}></span>
            <span className="text-xs text-slate-400">{t('low')}</span>
            <span className="inline-block w-4 h-4 rounded" style={{background:'hsl(188, 70%, 35%)'}}></span>
            <span className="inline-block w-4 h-4 rounded" style={{background:'hsl(188, 80%, 45%)'}}></span>
            <span className="inline-block w-4 h-4 rounded" style={{background:'hsl(188, 90%, 60%)'}}></span>
            <span className="text-xs text-slate-400">{t('high')}</span>
        </div>

        <div className="h-[500px] rounded-lg overflow-hidden border border-cyan-400/20 mt-2">
            <MapContainer center={[13.7563, 100.5018]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%', backgroundColor: '#0d1117' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
        </div>

        {unmatchedKeys.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700 font-mono text-xs">
                <h4 className="font-semibold text-orange-400 mb-2">{t('mapMismatch')}</h4>
                <p className="text-slate-400 mb-3">{t('mapMismatchHelp')}</p>
                <ul className="list-disc pl-5 space-y-1">
                    {unmatchedKeys.slice(0, 10).map(key => (
                    <li key={key}>
                        <span className="text-slate-200">'{key}'</span>
                        <span className="text-slate-400"> (Count: {byProvince[key]})</span>
                    </li>
                    ))}
                    {unmatchedKeys.length > 10 && <li>{t('andMore').replace('{count}', String(unmatchedKeys.length - 10))}</li>}
                </ul>
            </div>
        )}
    </div>
  );
};

export default ProvinceMap;