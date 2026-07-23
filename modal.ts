class Modal {
  private modal: HTMLElement;

  constructor(id: string) {
    this.modal = document.getElementById(id)!;
  }

  open(): void {
    this.modal.style.display = "block";
  }

  close(): void {
    this.modal.style.display = "none";
  }
}

const modal = new Modal("myModal");
modal.open();
