import React from 'react';
import { FiPlus, FiMinus, FiHome, FiCompass, FiMaximize, FiDownload } from 'react-icons/fi';
import { useMapContext } from '../../context/MapContext';
import { exportService } from '../../services/exportService';

interface GISToolbarProps {
  mapContainerId: string;
}

export const GISToolbar: React.FC<GISToolbarProps> = ({ mapContainerId }) => {
  const { mapRef, resetView } = useMapContext();

  const zoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const zoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const locateMe = () => {
    if (mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 12 });
    }
  };

  const toggleFullscreen = () => {
    const el = document.getElementById(mapContainerId);
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const exportMapImage = () => {
    exportService.exportPNG(mapContainerId, 'india_water_gis_map');
  };

  const buttonClass = "p-2.5 rounded-xl bg-background-light/90 hover:bg-background-lighter border border-white/10 text-white/80 hover:text-primary hover:border-primary/40 shadow-lg transition-all duration-200";

  return (
    <div className="flex flex-col gap-2 p-1.5 bg-background/60 backdrop-blur-md border border-white/5 rounded-2xl w-max">
      <button onClick={zoomIn} title="Zoom In" className={buttonClass}>
        <FiPlus size={16} />
      </button>
      <button onClick={zoomOut} title="Zoom Out" className={buttonClass}>
        <FiMinus size={16} />
      </button>
      <button onClick={resetView} title="Reset View" className={buttonClass}>
        <FiHome size={15} />
      </button>
      <button onClick={locateMe} title="My Location" className={buttonClass}>
        <FiCompass size={15} />
      </button>
      <button onClick={toggleFullscreen} title="Toggle Fullscreen" className={buttonClass}>
        <FiMaximize size={15} />
      </button>
      <div className="h-[1px] bg-white/10 my-1 mx-2" />
      <button onClick={exportMapImage} title="Export Screenshot" className={buttonClass}>
        <FiDownload size={15} />
      </button>
    </div>
  );
};

export default GISToolbar;
