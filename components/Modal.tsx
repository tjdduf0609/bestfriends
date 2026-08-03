type ModalProps = {
  open: boolean;
  title: string;
  description?: string;

  onClose: () => void;
  onConfirm: () => void;

};


export default function Modal({
  open,
  title,
  description,
  onClose,
  onConfirm,

}: ModalProps) {


  if (!open) return null;


  return (

    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-black/40
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-sm
          rounded-xl
          bg-white
          p-6
        "
      >

        <h2 className="text-xl font-bold">
          {title}
        </h2>


        {description && (

          <p className="mt-3 text-gray-500">
            {description}
          </p>

        )}


        <div className="mt-6 flex gap-3">


          <button
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              border
              py-3
              font-bold
            "
          >
            취소
          </button>


          <button
            onClick={onConfirm}
            className="
              flex-1
              rounded-xl
              bg-black
              py-3
              font-bold
              text-white
            "
          >
            삭제
          </button>


        </div>

      </div>

    </div>

  );

}