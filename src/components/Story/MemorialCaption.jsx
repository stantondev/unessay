import './MemorialCaption.css';

export default function MemorialCaption() {
  return (
    <div className="memorial-caption">
      <div className="memorial-caption-dot-legend" aria-hidden="true">
        <span className="memorial-caption-dot" />
      </div>
      <div className="memorial-caption-body">
        <div className="memorial-caption-label">Each dot = one death</div>
        <p className="memorial-caption-text">
          Dots appear where deaths are documented: the Fort Cass internment camps
          (where hundreds died before the march began), the Mississippi River
          ice crossing, Hopkinsville (where White Path is buried), Little Rock
          (where Quatie Ross died aboard the steamboat Victoria on February 1,
          1839), and scattered along the routes themselves. The precise count
          will never be known. These dots represent the historical estimate of
          2,000 to 4,000 Cherokee lives.
        </p>
      </div>
    </div>
  );
}
