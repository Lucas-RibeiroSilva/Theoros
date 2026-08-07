import "../../../styles/cards/separateBoxs.css"
import ExpansionsSection from "./expansions";
import LimitationsSection from "./limitations"

export default function ModifiersSection({ onLoading }) {
    const handleChildLoading = (isLoading) => {
        onLoading(isLoading);
    };

     return (
       <div className="lists">
                   
            {/* Esquerda - ampliações */}
            <div className="list-expansions">
                <ExpansionsSection onLoading={handleChildLoading}/>
            </div>

            {/* Direita - limitações */}
            <div className="list-limitations">
                <LimitationsSection onLoading={handleChildLoading}/>
            </div>

        </div>
    );
}