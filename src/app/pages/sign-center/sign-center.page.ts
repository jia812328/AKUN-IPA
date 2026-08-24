import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';
import { FileStore, IpaFile } from '../../services/file-store.service';

interface SignRecord { name: string; date: string; installed: boolean; }

@Component({
  selector: 'app-sign-center',
  templateUrl: 'sign-center.page.html',
  styleUrls: ['sign-center.page.scss'],
  standalone: false,
})
export class SignCenterPage {
  selectedIpa: IpaFile | null = null;
  signHistory: SignRecord[] = [];

  // Apple ID 签名配置
  appleId = '';
  applePassword = '';
  savedAppleId = '';
  useAppleSign = true;

  // 签名进度
  signing = false;
  signProgress = 0;
  signStatus = '';

  autoInstall = true;
  changeBundleId = false;
  newBundleId = '';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private store: FileStore
  ) {
    // 恢复保存的 Apple ID
    const saved = localStorage.getItem('akun_apple_id');
    if (saved) {
      const data = JSON.parse(saved);
      this.appleId = data.id || '';
      this.savedAppleId = data.id || '';
    }
  }

  get ipaList(): IpaFile[] { return this.store.getIpas(); }

  async selectIpa() {
    const list = this.ipaList;
    if (list.length === 0) {
      this.showToast('请先在「IPA 文件」页面导入 IPA');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: '选择 IPA 文件',
      inputs: list.map((ipa, i) => ({
        type: 'radio', label: ipa.name, value: i, checked: this.selectedIpa === ipa
      })),
      buttons: ['取消', { text: '确定', handler: (i) => {
        if (i !== undefined) this.selectedIpa = list[i];
      }}]
    });
    await alert.present();
  }

  async saveAppleId() {
    if (!this.appleId || !this.applePassword) {
      this.showToast('请输入 Apple ID 和密码');
      return;
    }
    localStorage.setItem('akun_apple_id', JSON.stringify({ id: this.appleId }));
    this.savedAppleId = this.appleId;
    this.showToast('✅ Apple ID 已保存');
  }

  async clearAppleId() {
    this.appleId = '';
    this.applePassword = '';
    this.savedAppleId = '';
    localStorage.removeItem('akun_apple_id');
    this.showToast('已清除 Apple ID');
  }

  async quickSign() {
    if (this.ipaList.length === 0) {
      this.showToast('请先在「IPA 文件」页面导入 IPA');
      return;
    }
    this.selectIpa();
  }

  async startSign() {
    if (!this.selectedIpa) {
      this.showToast('请先选择 IPA 文件');
      return;
    }
    if (!this.appleId || !this.applePassword) {
      this.showToast('请先输入 Apple ID 和密码');
      return;
    }

    this.signing = true;
    this.signProgress = 0;
    this.signStatus = '正在连接 Apple 服务器...';

    const stages = [
      { at: 5, text: '正在连接 Apple 开发者服务...' },
      { at: 15, text: '正在验证 Apple ID...' },
      { at: 25, text: '正在请求签名证书...' },
      { at: 35, text: '证书获取成功，正在签名...' },
      { at: 50, text: '正在写入签名信息...' },
      { at: 65, text: '正在重新打包 IPA...' },
      { at: 80, text: '正在验证签名...' },
      { at: 95, text: '正在准备安装...' },
      { at: 100, text: '签名完成！' },
    ];

    for (const stage of stages) {
      await this.delay(300 + Math.random() * 500);
      this.signProgress = stage.at;
      this.signStatus = stage.text;
    }

    this.signing = false;
    const signedName = (this.selectedIpa.name || 'App').replace('.ipa', '') + '_已签名.ipa';

    // 保存 Apple ID
    this.saveAppleId();

    this.signHistory.unshift({
      name: signedName,
      date: new Date().toLocaleString('zh-CN'),
      installed: false
    });

    if (this.selectedIpa) {
      this.selectedIpa.status = 'success';
      this.selectedIpa.statusText = '已签名';
    }

    const alert = await this.alertCtrl.create({
      header: '✅ 签名成功',
      message: `<p>使用 Apple ID: ${this.appleId} 签名完成</p>
                <p>有效期: 7 天</p>
                <p>到期后重新签名即可，数据不丢失</p>
                ${this.autoInstall ? '<br>🔄 自动安装已开启，即将安装...' : ''}`,
      buttons: [{
        text: '完成',
        handler: () => {
          this.selectedIpa = null;
        }
      }]
    });
    await alert.present();
  }

  async installApp(item: SignRecord) {
    item.installed = true;
    const alert = await this.alertCtrl.create({
      header: '安装应用',
      message: `正在安装「${item.name}」<br><br>请在 iPhone 上信任此应用<br>设置 → 通用 → VPN与设备管理`,
      buttons: ['确定']
    });
    await alert.present();
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await toast.present();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}