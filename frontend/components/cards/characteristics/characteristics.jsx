import "../../../styles/cards/separateBoxs.css"
import DisadvantagensSection from "./disadvantage";
import AdvantagensSection from "./advantagens";

export default function CharacteristicsSection({ onLoading }) {
    const handleChildLoading = (isLoading) => {
        onLoading(isLoading);
    };

    return (
        <>
            <div className="lists">

                {/* Esquerda - Vantagens */}
                <div className="list-advantages">
                    <AdvantagensSection onLoading={handleChildLoading}/>
                </div>

                {/* Direita - Desvantagens */}
                <div className="list-disadvantages">
                    <DisadvantagensSection onLoading={handleChildLoading}/>
                </div>

            </div>
        </>
    );
}