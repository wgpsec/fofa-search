<template>
  <div class="main">
    <a-spin tip="Loading..." :delay="1" :spinning="MainLoading">
      <br />
      <div class="top">
        <span>{{MainDesc.author}}：zhizhuo</span>
        <span style="margin-left: 10px">{{MainDesc.team}}：WgpSec</span>
        <a-button type="primary" shape="round" style="float: right;margin-right: 20px" @click="create_goby()">{{MainDesc.open_goby}}</a-button>
      </div>
      <div class="fofa-group">
        <div>
          <a-divider style="font-size: 18px">{{ MainDesc.title }}</a-divider>
          <div>
            <a-spin :delay="1" :spinning="HostStatus">
              <p>
                <span>
                  IP：<a-tag color="green" style="font-size: 14px">
                    {{ HostData.ip }}
                  </a-tag>
                </span>
                <span>
                  {{ MainDesc.description.country }}：<a-tag
                    color="green"
                    style="font-size: 14px"
                  >
                    {{ HostData.country }}
                  </a-tag>
                </span>
                <span>
                  {{ MainDesc.description.city }}：<a-tag
                    color="green"
                    style="font-size: 14px"
                  >
                    {{ HostData.city }}
                  </a-tag>
                </span>
              </p>
              <p>
                <span>
                  {{ MainDesc.description.organization }}：<a-tag
                    color="green"
                    style="font-size: 14px"
                  >
                    {{ HostData.group }}
                  </a-tag>
                </span>
                <span>
                  ISP：<a-tag color="green" style="font-size: 14px">
                    {{ HostData.isp }}
                  </a-tag>
                </span>
                <span>
                  ASN：<a-tag color="green" style="font-size: 14px">
                    {{ HostData.asn }}
                  </a-tag>
                </span>
              </p>
              <p>
                <span>
                  {{ MainDesc.description.lastime }}：<a-tag
                    color="green"
                    style="font-size: 14px"
                  >
                    {{ HostData.update_time }}
                  </a-tag>
                </span>
              </p>
            </a-spin>
          </div>
        </div>
        <a-divider style="font-size: 18px">{{ MainDesc.portitle }}</a-divider>
        <div v-if="Ip || Domain">
          <div>
            {{ MainDesc.portdescription.recommendtitle }}：
            <a-tag color="green" style="font-size: 14px"> {{ Ip }} </a-tag>
            <a-button size="small" @click="copy(Ip)">
              <template #icon>
                <CopyOutlined :style="{ fontSize: '12px', color: '#08c' }" />
              </template>
            </a-button>
            OR&nbsp;&nbsp;<a-tag color="green" style="font-size: 14px">
              {{ Domain }}
            </a-tag>
            <a-button size="small" @click="copy(Domain)">
              <template #icon>
                <CopyOutlined :style="{ fontSize: '12px', color: '#08c' }" />
              </template>
            </a-button>
          </div>
        </div>
        <div v-else-if="Ip === 0 && Domain === 0">
          <p>
            {{ MainDesc.portdescription.recommendtitle }}：{{
              MainDesc.portdescription.prompterror
            }}
          </p>
        </div>
        <div v-else>
          <p>
            {{ MainDesc.portdescription.recommendtitle }}：{{
              MainDesc.portdescription.prompt
            }}
          </p>
        </div>
      </div>
      <div class="table">
        <a-table
          :dataSource="dataSource"
          :columns="columns"
          :loading="tableLoading"
          :locale="{ emptyText: '暂无数据' }"
          :bordered="true"
          :size="small"
        >
          <template #name="{ text }">
            {{ text }}
          </template>
          <template #port="{ text: port }">
            <span>
              <a-tag color="green">
                {{ port }}
              </a-tag>
            </span>
          </template>
          <template #base_protocol="{ text: base_protocol }">
            <span>
              <a-tag color="cyan">
                {{ base_protocol }}
              </a-tag>
            </span>
          </template>
          <template #protocol="{ text: protocol }">
            <span>
              <a-tag color="blue">
                {{ protocol }}
              </a-tag>
            </span>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>
<script>
import { ref, getCurrentInstance, onMounted, defineComponent } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import * as cheerio from "cheerio";


export default defineComponent({
  components: {
    CopyOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance(); //来获取全局 globalProperties 中配置的信息
    //定义变量
    const urldata = ref(null);//url地址
    const domaindata = ref("");
    const dataSource = ref([]);
    const Ip = ref(null);
    const Domain = ref(null);
    const HostData = ref({});
    const HostStatus = ref();
    const tableLoading = ref();
    const MainLoading = ref(false);
    const PortList=ref([])
    //国际化开发语言
    const MainDesc = ref({
      "author": "Author",
      "team": "Team",
      "title": "Basic information",
      "open_goby": "Create a goby scan",
      "description": {
        "country": "Country/Region",
        "city": "City",
        "organization": "Org",
        "lastime": "Last update time"
      },
      "seotitle": "SEO Information",
      "portitle": "Open Port",
      "portdescription": {
        "recommendtitle": "FOFA Query",
        "prompt": "Loading",
        "prompterror": "N/A"
      },
      "MainError": {
        "buttonerror": "Do not click this plugin in the Plugin Center!",
        "geturlerror": "Failed to obtain url, please refresh Tab",
        "create_error": "Creation failure",
        "create_success":"Created successfully"
      }
    });
    MainDesc.value = JSON.parse(
      // eslint-disable-next-line no-undef
      chrome.i18n.getMessage("MainDesc").replaceAll("'", '"')
    );

    //监听事件
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (
        request.click === "sendurl" &&
        MainLoading.value === true &&
        HostStatus.value === true &&
        tableLoading.value === true
      ) {
        getHost();
        get_urlinfo();
        return;
      }
      sendResponse("OK");
    });

    //获取URL
    const get_url = () => {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let url = tabs[0].url;
        let UrlReg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
        if (UrlReg.test(url)) {
          url = url.replace("https://", "").replace("http://", "");
          url = url.substring(0, url.indexOf("/"));
          if (url.indexOf(":") > 0) {
            url = url.substring(0, url.indexOf(":"));
          }
          urldata.value = url;
        } else if (url.indexOf("chrome://") !== -1) {
          MainLoading.value = false;
          tableLoading.value = false;
          HostStatus.value = false;
          urldata.value = null;
          Ip.value = 0;
          Domain.value = 0;
          message.error(MainDesc.value.MainError.buttonerror);
        } else {
          MainLoading.value = false;
          tableLoading.value = false;
          HostStatus.value = false;
          urldata.value = null;
          Ip.value = 0;
          Domain.value = 0;
          message.error(MainDesc.value.MainError.get_urlerror);
        }
      });
    };

    //获取站点信息
    const get_urlinfo = () => {
      try {
        let search = urldata.value;
        let domain = null;
        proxy.$get(`https://amap.fofa.info/host/${search}`).then((res) => {
          domaindata.value = res;
          MainLoading.value = false;
          tableLoading.value = false;
          if (!res.error) {
            if (res.domain) {
              let domainlist = res.domain.split(".");
              if (domainlist.length > 2) {
                let rpdata = domainlist[0] + ".";
                domain = res.domain.replace(rpdata, "");
              } else {
                domain = res.domain;
              }
            } else {
              domain = null;
            }
            Ip.value = `ip="${res.ip}"`;
            Domain.value = `domain="${domain}"`;
            res.ports.forEach((item) => {
              let resultdata = {};
              PortList.value.push(item.port)
              resultdata.port = item.port;
              resultdata.base_protocol = item.base_protocol;
              resultdata.protocol = item.protocol;
              dataSource.value.push(resultdata);
            });
          } else {
            Ip.value = 0;
            Domain.value = 0;
            message.error(res.errmsg);
          }
        });
      } catch (error) {
        MainLoading.value = false;
        tableLoading.value = false;
        message.error("ERROR:" + error.message);
      }
    };

    //获取host聚合
    const getHost = () => {
      try {
        let host_ip = urldata.value;
        proxy.$get(`https://fofa.info/hosts/${host_ip}`).then((response) => {
          MainLoading.value = false;
          HostStatus.value = false;
          let root = cheerio.load(response);
          let elementData = root("div[class~=ipDiv]")
            .text()
            .replace(/&nbsp;/g, "")
            .replace(/\n/g, "")
            .replace(/\r/g, "")
            .replace(/\t/g, "");
          HostData.value.ip = elementData
            .substring(
              elementData.indexOf("IP:") + "IP:".length,
              elementData.indexOf("国家/地区:")
            )
            .trim();
          HostData.value.country = elementData
            .substring(
              elementData.indexOf("国家/地区:") + "国家/地区:".length,
              elementData.indexOf("城市:")
            )
            .trim();
          HostData.value.city = elementData
            .substring(
              elementData.indexOf("城市:") + "城市:".length,
              elementData.indexOf("组织:")
            )
            .trim();
          HostData.value.group = elementData
            .substring(
              elementData.indexOf("组织:") + "组织:".length,
              elementData.indexOf("ISP:")
            )
            .trim();
          HostData.value.isp = elementData
            .substring(
              elementData.indexOf("ISP:") + "ISP:".length,
              elementData.indexOf("ASN:")
            )
            .trim();
          HostData.value.asn = elementData
            .substring(
              elementData.indexOf("ASN:") + "ASN:".length,
              elementData.indexOf("最后更新时间:")
            )
            .trim();
          HostData.value.update_time = elementData
            .substring(
              elementData.indexOf("最后更新时间:") + "最后更新时间:".length,
              elementData.indexOf("端口")
            )
            .trim();
        });
      } catch (error) {
        MainLoading.value = false;
        HostStatus.value = false;
        message.error("ERROR:" + error.message);
      }
    };

    //单击复制事件
    const copy = (event) => {
      navigator.clipboard.writeText(event).then(() => {
        message.success("Copy Success");
      });
    };
    //创建goby扫描任务
    const create_goby=()=>{
      let ips=urldata.value
      let ports=PortList.value
      const goby_url = `goby://openScanDia?ips=${ips}&&ports=${ports.join(',')}`;
      if(!ips || !ports){
        message.error(MainDesc.value.MainError.create_error)
      }else{
        message.success(MainDesc.value.MainError.create_success)
        window.open(goby_url)
      }
    }
    //节点挂在执行的事件
    onMounted(() => {
      tableLoading.value = true;
      HostStatus.value = true;
      MainLoading.value = true;
      get_url();
    });

    return {
      dataSource,

      columns: [
        {
          title: "PORT",
          dataIndex: "port",
          key: "port",
          align: "center",
          slots: {
            customRender: "port",
          },
        },
        {
          title: "Base Protocol",
          dataIndex: "base_protocol",
          key: "base_protocol",
          align: "center",
          slots: {
            customRender: "base_protocol",
          },
        },
        {
          title: "Protocol",
          dataIndex: "protocol",
          key: "protocol",
          align: "center",
          slots: {
            customRender: "protocol",
          },
        },
      ],

      //定义的全局变量
      Ip,
      Domain,
      HostData,
      HostStatus,
      MainLoading,
      tableLoading,
      MainDesc,

      //自定义函数
      copy,
      create_goby,
    };
  },
});
</script>
<style scoped>
.main {
  width: 600px;
  height: 400px;
}
.top{
  margin-left: 25px;
  font-size: 13px;
}
.fofa-group {
  margin-left: 25px;
  font-size: 15px;
}
.table {
  width: 550px;
  margin: 10px auto 0 auto;
}
</style>
