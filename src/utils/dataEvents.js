export const emitDataChange = () => {
    window.dispatchEvent(new Event("appDataUpdated"));
}