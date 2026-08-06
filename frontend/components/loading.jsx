import "../styles/components/loading.css"

export default function Loading(){
    return (
      <div className="loading-overlay">
        <img id="loading" src="/loading.gif" alt="carragamento" />
        <h2 id="loading-text">Carregando</h2>
      </div>
    );
}