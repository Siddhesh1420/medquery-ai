export default function Disclaimer() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-xs mt-2"
      style={{backgroundColor: '#1a1a00', border: '1px solid #854d0e', color: '#fbbf24'}}>
      <span className="text-base mt-0.5">⚠️</span>
      <p>
        <strong>Medical Disclaimer:</strong> This information is for educational purposes only 
        and should not replace professional medical advice. Always consult a qualified 
        healthcare provider for medical decisions.
      </p>
    </div>
  )
}