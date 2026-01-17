import type { ILLMAdapter, LLMAdapterType } from '@/types/llm';
import { DirectLLMAdapter } from './direct-llm-adapter';
import { APILLMAdapter } from './api-llm-adapter';

const LLM_ADAPTER_TYPE_KEY = 'gs_llm_adapter_type';

export class LLMConfig {
  private static instance: LLMConfig;
  private currentAdapter: ILLMAdapter;
  private currentType: LLMAdapterType;
  private directAdapter: DirectLLMAdapter;
  private apiAdapter: APILLMAdapter;

  private constructor() {
    const savedType = (localStorage.getItem(LLM_ADAPTER_TYPE_KEY) as LLMAdapterType) || 'direct';
    this.currentType = savedType;
    this.directAdapter = new DirectLLMAdapter();
    this.apiAdapter = new APILLMAdapter();
    this.currentAdapter = this.createAdapter(savedType);
  }

  static getInstance(): LLMConfig {
    if (!LLMConfig.instance) {
      LLMConfig.instance = new LLMConfig();
    }
    return LLMConfig.instance;
  }

  private createAdapter(type: LLMAdapterType): ILLMAdapter {
    switch (type) {
      case 'direct':
        return this.directAdapter;
      case 'api':
        return this.apiAdapter;
      default:
        return this.directAdapter;
    }
  }

  getAdapter(): ILLMAdapter {
    return this.currentAdapter;
  }

  getDirectAdapter(): DirectLLMAdapter {
    return this.directAdapter;
  }

  getCurrentType(): LLMAdapterType {
    return this.currentType;
  }

  setAdapterType(type: LLMAdapterType): void {
    if (type !== this.currentType) {
      this.currentType = type;
      this.currentAdapter = this.createAdapter(type);
      localStorage.setItem(LLM_ADAPTER_TYPE_KEY, type);
    }
  }

  isConfigured(): boolean {
    return this.currentAdapter.isConfigured();
  }
}

export const llmConfig = LLMConfig.getInstance();
export const getLLMAdapter = (): ILLMAdapter => llmConfig.getAdapter();
