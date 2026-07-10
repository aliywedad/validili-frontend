import Swal from 'sweetalert2';

const EMERALD = '#059669';
const RED = '#dc2626';
const SLATE = '#64748b';

export async function confirmDelete(options: { title: string; text?: string }): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: RED,
    cancelButtonColor: SLATE,
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export function showSuccessToast(message: string) {
  Swal.fire({
    icon: 'success',
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

export function showErrorAlert(message: string) {
  Swal.fire({
    icon: 'error',
    title: 'Erreur',
    text: message,
    confirmButtonColor: EMERALD,
  });
}
