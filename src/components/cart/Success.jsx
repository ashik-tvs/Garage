const Success = ({ loading, showSuccess }) => {
  if (!loading && !showSuccess) return null;

  return (
    <div className="overlay">
      {loading && (
        <div className="loading-center">
          <div className="loader"></div>
        </div>
      )}

      {showSuccess && (
        <div className="success-popup-center">
          <div className="success-card">
            <div className="success-tick">✔</div>
            <p className="success-msg">Thank you for your Order!</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Success;