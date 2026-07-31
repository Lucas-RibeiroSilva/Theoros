import "../../../styles/cards/separateBoxs.css"
import ExpertiseSection from "./expertise";
import TechniqueSection from "./technique";

export default function SpecializationsSection({ onLoading }) {
  const handleChildLoading = (isLoading) => {
        onLoading(isLoading);
    };

  return (
    <div className="lists">
      
      {/* Esquerda - Perícias */}
      <div className="list-expertise">
        <ExpertiseSection onLoading={handleChildLoading}/>
      </div>

      {/* Direieta - Técnicas */}
      <div className="list-technique">
        <TechniqueSection onLoading={handleChildLoading}/>
      </div>

    </div>
  );
}
