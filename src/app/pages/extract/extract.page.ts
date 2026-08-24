import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';

interface ExtractItem {
  name: string;
  path: string;
  size: string;
  isDir: boolean;
  children?: ExtractItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-extract',
  templateUrl: 'extract.page.html',
  styleUrls: ['extract.page.scss'],
  standalone: false,
})
export class ExtractPage {
  selectedFile: File | null = null;
  selectedFileName = '';
  extractedItems: ExtractItem[] = [];
  extracting = false;
  extractProgress = 0;
  extractStatus = '';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  selectZip() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.ipa';
    input.onchange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        this.selectedFile = e.target.files[0];
        this.selectedFileName = e.target.files[0].name;
      }
    };
    input.click();
  }

  async extractZip() {
    if (!this.selectedFile) {
      this.showToast('请先选择 ZIP 或 IPA 文件');
      return;
    }

    this.extracting = true;
    this.extractProgress = 0;
    this.extractStatus = '正在读取文件...';

    // 模拟解压进度
    const stages = [
      { at: 15, text: '正在解析压缩包...' },
      { at: 30, text: '正在提取文件列表...' },
      { at: 50, text: '正在解压文件中...' },
      { at: 70, text: '正在整理文件结构...' },
      { at: 85, text: '正在验证文件完整性...' },
      { at: 100, text: '提取完成！' },
    ];

    for (const stage of stages) {
      await this.delay(300 + Math.random() * 400);
      this.extractProgress = stage.at;
      this.extractStatus = stage.text;
    }

    // 模拟提取结果
    this.extractedItems = this.generateMockExtract(this.selectedFileName);
    this.extracting = false;

    this.showToast(`✅ 已提取 ${this.extractedItems.length} 个文件`);
  }

  toggleExpand(item: ExtractItem) {
    if (item.isDir) {
      item.expanded = !item.expanded;
    }
  }

  importItem(item: ExtractItem) {
    this.alertCtrl.create({
      header: '导入文件',
      message: `将「${item.name}」导入到文件列表？`,
      buttons: [
        '取消',
        { text: '导入', handler: () => {
          this.showToast(`✅ 已导入「${item.name}」`);
        }}
      ]
    }).then(a => a.present());
  }

  importAll() {
    this.alertCtrl.create({
      header: '导入全部',
      message: `确定导入所有 ${this.extractedItems.length} 个文件？`,
      buttons: [
        '取消',
        { text: '导入全部', handler: () => {
          this.showToast(`✅ 已导入全部 ${this.extractedItems.length} 个文件`);
        }}
      ]
    }).then(a => a.present());
  }

  clearExtract() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.extractedItems = [];
    this.extractProgress = 0;
    this.extractStatus = '';
  }

  private generateMockExtract(zipName: string): ExtractItem[] {
    const baseName = zipName.replace(/\.(zip|ipa)$/i, '');
    const isIpa = zipName.toLowerCase().endsWith('.ipa');

    if (isIpa) {
      return [
        { name: 'Payload', path: 'Payload', size: '', isDir: true, expanded: true, children: [
          { name: `${baseName}.app`, path: `Payload/${baseName}.app`, size: '', isDir: true, expanded: false, children: [
            { name: baseName, path: `Payload/${baseName}.app/${baseName}`, size: '12.5 MB', isDir: false },
            { name: 'Info.plist', path: `Payload/${baseName}.app/Info.plist`, size: '2.3 KB', isDir: false },
            { name: 'PkgInfo', path: `Payload/${baseName}.app/PkgInfo`, size: '8 B', isDir: false },
            { name: 'embedded.mobileprovision', path: `Payload/${baseName}.app/embedded.mobileprovision`, size: '5.1 KB', isDir: false },
            { name: 'Assets.car', path: `Payload/${baseName}.app/Assets.car`, size: '1.2 MB', isDir: false },
            { name: 'Frameworks', path: `Payload/${baseName}.app/Frameworks`, size: '', isDir: true, expanded: false, children: [
              { name: 'libswiftCore.dylib', path: `Payload/${baseName}.app/Frameworks/libswiftCore.dylib`, size: '3.8 MB', isDir: false },
            ]},
          ]}
        ]}
      ];
    }

    // ZIP 文件
    return [
      { name: '证书文件', path: '证书文件', size: '', isDir: true, expanded: true, children: [
        { name: 'AKUN_iOS.p12', path: '证书文件/AKUN_iOS.p12', size: '3.6 KB', isDir: false },
        { name: 'AKUN.mobileprovision', path: '证书文件/AKUN.mobileprovision', size: '2.6 KB', isDir: false },
      ]},
      { name: 'IPA 文件', path: 'IPA 文件', size: '', isDir: true, expanded: true, children: [
        { name: 'App_v1.0.ipa', path: 'IPA 文件/App_v1.0.ipa', size: '45.2 MB', isDir: false },
      ]},
      { name: '资源文件', path: '资源文件', size: '', isDir: true, expanded: false, children: [
        { name: 'icon.png', path: '资源文件/icon.png', size: '165 KB', isDir: false },
        { name: 'background.jpg', path: '资源文件/background.jpg', size: '2.1 MB', isDir: false },
      ]},
    ];
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await toast.present();
  }
}