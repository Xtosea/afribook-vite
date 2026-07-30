import { StickerPicker } from ".../../components/stickers";

export default function StickerTest() {

    function handleSticker(path){
        console.log(path);
        alert(path);
    }

    return (
        <div style={{padding:20}}>
            <h2>Sticker Test</h2>

            <StickerPicker
                onSelect={handleSticker}
            />
        </div>
    );
}